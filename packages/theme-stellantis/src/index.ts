import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Stellantis N.V. corporate brand theme for the Sentropic token structure.
 *
 * Stellantis publishes NO tokenised design system. This package is a
 * MEASURED-CLONE built from the corporate site's own Adobe Experience Manager
 * client libraries (`stellantis-corporate/clientlibs/*`), read 2026-09-24. Only
 * public CSS values and font *names* are referenced — never font binaries and
 * never logo artwork. Derived values carry the `à confirmer` marker inline and
 * a row in MAPPING.md.
 *
 * SCOPE — this is the CORPORATE Stellantis identity, not the identity of any
 * group marque (Peugeot, Citroën, Fiat, Opel, Jeep, …). No value below comes
 * from a marque site.
 *
 * VENDOR EXCLUSION (method step 0.5). Three of the five stylesheets the
 * homepage links are NOT the brand and are excluded as origins:
 *   - `clientlib-vendors.min.css` — Bootstrap 5.3 (`--bs-*`, `[data-bs-theme]`).
 *   - `clientlib-base.min.css` — the AEM `.aem-Grid` layout framework (it
 *     declares no colour at all).
 *   - `clientlib-site.min.css` LINES 1–403 (pretty-printed) — an embedded
 *     Bootstrap 4/5 compatibility shim (`.ml-auto`, `.pl-3`, `.badge-pill`,
 *     `.rounded-sm`, `.custom-control`, `.card-deck`, `a{text-decoration:none}`).
 *     Only that file's rules from `html *{scrollbar-width:none}` (line 405)
 *     onward are treated as brand-owned. The boundary is NOT clean: two
 *     brand rules sit inside that region — `.version::before{content:"Version:
 *     2.16.01";visibility:hidden}` (line 1) and `.btn-check:checked+.btn,…,
 *     :not(.btn-check)+.btn:active{color:#505050}` (line 357, the brand grey
 *     patched onto Bootstrap's `.btn`). Neither is used as an origin here, and
 *     no value below comes from lines 1–403. See MAPPING.md.
 * The consent banner served from `cookielaw.emea.fcagroup.com` is likewise
 * excluded. Brand-owned origins are therefore: `clientlib-site.min.css`
 * (brand region), `clientlib-site-page.min.css`, `clientlib-site-mobile.min.css`.
 *
 * REM ROOT — neither host declares `font-size` on `html` or `:root`
 * (no `62.5%` trick anywhere), so the brand's rem root is the browser default
 * 16px and every px/rem length below transcribes 1:1 into this theme's own
 * 16px-root output.
 *
 * HOST DISAGREEMENT (method step 0.3) — `www.stellantis.com` and
 * `media.stellantis.com` do NOT declare the same brand blue nor the same
 * typeface. The corporate host wins; see MAPPING.md for the counts and the
 * arbitration.
 */

// --- Stellantis raw measured palette ---------------------------------------
// Every entry names the CSS declaration it was read from. File keys:
//   [site]   = /etc.clientlibs/stellantis-corporate/clientlibs/clientlib-site.min.129893ddb5fa1c21d5d6b6418d0c6bd9.css
//              (brand region, from line 405 pretty-printed; this is the hash the
//              homepage manifest serves on 2026-09-24)
//   [page]   = …/clientlib-site-page.min.4bb169890317e8d4b95abd4208bdbcc9.css
//   [mobile] = …/clientlib-site-mobile.min.f80d3926ecd219e7e45920a510f07e3e.css
const stellantisColor = {
  // Stellantis corporate blue — the brand signature. 130 occurrences over the
  // three brand-owned files (site 3 / page 118 / mobile 9).
  blue: {
    // [site] .corporate-blue{background-color:#243882} — and [page]
    // .bg-blue-stellantis{background-color:#243882} / .blue-stellantis{color:#243882}
    primary: "#243882",
    // [page] .gradient-background-blue{background:radial-gradient(circle,rgba(36,55,130,1) 37%,rgba(28,45,101,1) 100%)}
    // — the deep end of the brand's own blue gradient, declared as rgba(28,45,101,1).
    // Applied to the primary :hover role (role assignment à confirmer).
    deep: "#1c2d65",
    // [site] .corporate-blue-50{background-color:#7b88b4} — the brand's own 50% tint.
    tint50: "#7b88b4",
    // derived: #243882 at 10% over white (à confirmer) — the brand publishes no
    // light blue tint of its own.
    tint10: "#e9ebf3"
  },
  // Anthracite / "corporate dark blue" — 39 occurrences (site 2 / page 36 / mobile 1).
  anthracite: {
    // [site] .corporate-dark-blue{background:#282b34;color:#fff} — and [page]
    // .bg-anthracite{background-color:#282b34} / .anthracite{color:#282b34}
    base: "#282b34"
  },
  // Neutral scale, all read from brand-owned rules.
  grey: {
    // [page] body.no-front #container-overlay{background:#fff} / [site] #bottom-menu{background:#fff}
    0: "#ffffff",
    // [site] .bg-grey-page{background-color:#f0f0f0} / [page] #main.colored{background:#f0f0f0} — 49 occurrences
    page: "#f0f0f0",
    // [page] input#searchInput{border:1px solid #d3d3d3} / div.dateFilters select{border:1px solid #d3d3d3} — 10 occurrences
    line: "#d3d3d3",
    // [page] .results-list p.results-excerpt{color:#6a6a6a} — 3 occurrences
    mid: "#6a6a6a",
    // [page] p{font-size:18px;color:#505050;font-weight:400} / [site] .text-grey{color:#505050} — 68 occurrences
    body: "#505050",
    // [site] .clear-grey-stella,.clear-grey-stella a{color:#a0a0a0} — 7
    // occurrences (site 1 / page 6), the most frequent of the brand's faint
    // greys, so the frequency tie-break picks it as the muted-text candidate.
    // MEASURED but 2.61:1 on white: it fails the 4.5:1 text floor, so the muted
    // text role is routed through the stop rule (à confirmer, chain in MAPPING.md).
    // NOT RETAINED, same family: #767676 ([site] brand region, line 643 pretty-
    // printed, `.widget-content ul li span.title-style{color:#767676;…}`) — 1
    // occurrence, scoped to one widget, so the tie-break drops it. It reaches
    // 4.54:1 on white and would have passed the floor; it is set aside on
    // frequency and scope, not on contrast.
    faint: "#a0a0a0",
    // stop-rule result from #a0a0a0 (à confirmer) — 4 steps, 5.17:1 on white.
    // Chain, one convention throughout (HSL L − 0.05 per step, channel rounded
    // to nearest, ties away from zero):
    //   #939393 3.07 → #878787 3.59 → #7a7a7a 4.29 → #6d6d6d 5.17 (first pass).
    mutedText: "#6d6d6d",
    // [site] .using-keyboard :focus{outline:dashed;outline-color:#bbb;outline-width:1px;outline-offset:-2px;border-radius:2px}
    // declared as `#bbb`. MEASURED but 1.92:1 on white: it fails the 3:1
    // non-text floor, so focus.color is routed to the brand blue (see MAPPING.md).
    focusDeclared: "#bbbbbb"
  },
  // Brand accents — the named utility palette [page] declares at .tangerine /
  // .mint / .mint-light / .mint-dark.
  accent: {
    // [page] .tangerine{color:#e94e24} / .bg-tangerine{background-color:#e94e24}
    tangerine: "#e94e24",
    // [page] .mint{color:#43aaa0} / .bg-mint{background-color:#43aaa0}
    mint: "#43aaa0",
    // [page] .mint-light{color:#a0d4cd} / .bg-mint-light{background-color:#a0d4cd}
    mintLight: "#a0d4cd",
    // [page] .mint-dark{color:#006e6a} / .bg-mint-dark{background-color:#006e6a}
    mintDark: "#006e6a"
  },
  // Status family. Stellantis publishes no status/feedback palette; the two warm
  // roles are stop-rule results from brand-owned starting hexes.
  system: {
    // stop-rule result from [page] .alert-mail{color:#d85935;…;line-height:1.2em}
    // (3.89:1) — 1 step, 4.54:1 on white (à confirmer).
    error: "#cc4c27",
    // stop-rule result from the brand accent .tangerine #e94e24 (3.76:1) —
    // 2 steps, 5.23:1 on white (à confirmer).
    warning: "#c63a14"
  }
} as const;

// --- foundation (Stellantis-specific values) --------------------------------
const foundation = {
  color: {
    // The Sentropic "blue" role family carries the Stellantis corporate blue.
    blue: {
      10: stellantisColor.blue.tint10, // #e9ebf3 derived light tint (à confirmer)
      60: stellantisColor.blue.primary, // #243882 [site] .corporate-blue
      80: stellantisColor.blue.deep // #1c2d65 [page] .gradient-background-blue
    },
    // The "cyan" accent family carries the brand's measured mint scale.
    cyan: {
      10: stellantisColor.accent.mintLight, // #a0d4cd [page] .mint-light
      50: stellantisColor.accent.mint, // #43aaa0 [page] .mint
      70: stellantisColor.accent.mintDark // #006e6a [page] .mint-dark
    },
    // The "slate" family carries the brand's measured neutral scale.
    slate: {
      0: stellantisColor.grey[0], // #ffffff
      10: stellantisColor.grey.page, // #f0f0f0 [site] .bg-grey-page
      20: stellantisColor.grey.line, // #d3d3d3 [page] input#searchInput border
      60: stellantisColor.grey.mid, // #6a6a6a [page] .results-list p.results-excerpt
      80: stellantisColor.grey.body, // #505050 [page] p{}
      90: stellantisColor.anthracite.base // #282b34 [site] .corporate-dark-blue
    },
    feedback: {
      success: stellantisColor.accent.mintDark, // #006e6a [page] .mint-dark — success ROLE assignment à confirmer
      warning: stellantisColor.system.warning, // #c63a14 stop-rule from .tangerine (à confirmer)
      error: stellantisColor.system.error, // #cc4c27 stop-rule from .alert-mail (à confirmer)
      info: stellantisColor.blue.primary // #243882 — info ROLE assignment à confirmer
    }
  },
  // [site] body{font-family:"Encode Sans Condensed",sans-serif;letter-spacing:.01em}
  // is the site-wide body face; [page] h2,h3{font-family:"Encode Sans",sans-serif}
  // is the display face (64 "Encode Sans" declarations across the brand files).
  // Both are confirmed by the homepage's Google Fonts <link>. Font *names* only.
  font: {
    sans: "'Encode Sans Condensed', sans-serif",
    display: "'Encode Sans', sans-serif",
    // The corporate host declares NO monospace face in any of its three
    // brand-owned regions (grep for `mono` over them = 0 hits), so this is the
    // Sent Tech base system stack, unchanged (à confirmer). The losing second
    // host does publish one — [media] `font-family:SFMono-Regular,Menlo,Monaco,
    // Consolas,Liberation Mono,Courier New,monospace` (2 declarations) — but it
    // is Bootstrap's own default stack, not a Stellantis face.
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // The Sent Tech base 4px-grid rem scale, kept as-is (verified against
  // packages/tokens/src/foundation.ts) — corroborated by the brand's own measured
  // paddings (4px, 8px, 10px, 12px, 16px, 24px, 32px).
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    12: "3rem", // 48px
    16: "4rem" // 64px
  },
  // SQUARE CORNERS are the Stellantis signature: `border-radius:0` is declared
  // 50 times across the brand-owned regions ([page] 23, [mobile] 27, [site]
  // brand region 0) — buttons, inputs, selects, tabs, cards, breadcrumb, footer
  // button. Nothing rounds. A 51st `border-radius:0` exists as `.rounded-0`
  // at [site] shim line 71, inside the EXCLUDED Bootstrap region, and is not
  // counted here.
  radius: {
    none: "0",
    sm: "0", // [page] input#searchInput{border-radius:0}
    md: "0", // [page] .nav-tabs .nav-link{border-radius:0}
    lg: "0", // [page] .card-container-c42 .card{border-radius:0}
    // [mobile] ::-webkit-scrollbar-thumb{…border-radius:70px} — the brand's only
    // large-radius declaration; pill ROLE assignment à confirmer.
    pill: "70px"
  },
  shadow: {
    // [page] .sticky{…box-shadow:0 4px 6px rgba(0,0,0,0.1)}
    subtle: "0 4px 6px rgb(0 0 0 / 0.1)",
    // [page] #primary-menu{…box-shadow:0 -2px 16px 0 rgba(0,0,0,0.25)} and the
    // same declaration on header@min-width:992px. The NEGATIVE y offset is the
    // measured brand value (the header casts upward), transcribed as-is.
    medium: "0 -2px 16px 0 rgb(0 0 0 / 0.25)",
    // DERIVED (à confirmer) — the brand publishes only two box-shadows, so each
    // component of this third one is derived from a named measured component:
    //   y offset 8px  = the measured DOWNWARD offset of `shadow.subtle`
    //                   ([page] .sticky{box-shadow:0 4px 6px …}) doubled. The
    //                   medium's -2px is NOT reused: it is the header casting
    //                   upward, and a floating layer reads downward.
    //   blur 32px     = the measured medium blur 16px doubled.
    //   alpha 0.25    = the measured medium alpha, unchanged.
    floating: "0 8px 32px 0 rgb(0 0 0 / 0.25)"
  },
  motion: {
    fast: "100ms", // [page] transition:width .1s ease-in-out
    normal: "300ms", // the brand's dominant transition duration (.3s, 7 declarations)
    slow: "600ms", // [page] transition:transform .6s ease (4 declarations)
    easing: "ease" // the brand's dominant easing function (15 declarations)
  },
  // Not brand-specific: the Sent Tech base z scale, kept as-is (verified against
  // packages/tokens/src/foundation.ts). The brand's own stacking values
  // (0/1/2/7/10/20/100/800/900/960/990/991/999/1000/1030/1050/1080/1100/1280/9000)
  // are page-chrome specific, not role tokens.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Stellantis) -------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // the brand's dominant stroke: `border:1px` ×22, `border-bottom:1px` ×15
    thick: "2px" // [site] .bb2px{border-bottom:1px solid #f0f0f0;border-top:2px solid #f0f0f0;padding-top:16px}; also outline-width:2px on the skip link
  },
  borderStyle: { solid: "solid" },
  // Control density. controlHeight md is MEASURED: `height:40px` on FIVE
  // [page] control selectors — input#searchInput, div.dateFilters select,
  // button#searchActionBtn (40×40), .mobile-filters-open .resetDateBtn and
  // button.btn.btn-search-type. (`height:40px` occurs 8 times in all; the three
  // others — .multibar-img, .refine-filters-group, [mobile] .id38a
  // .mobile-gallery.controls — are not controls.)
  // paddingBlock 4px and paddingInline 8/16/24px are
  // measured on the brand's own buttons and chips. sm/lg controlHeight, every
  // `gap` and every `minWidth` are the Sent Tech base values (à confirmer):
  // the brand's other measured heights (42px filter chip, 64px header icon
  // square) are not a text-control size scale.
  density: {
    sm: {
      controlHeight: "2rem", // 32px — Sent Tech base (à confirmer)
      paddingBlock: "0.25rem", // 4px — [page] #category-filters-group .btn-category-filter{padding:4px 8px}
      paddingInline: "0.5rem", // 8px — same declaration
      gap: "0.375rem", // Sent Tech base (à confirmer)
      minWidth: "2rem" // Sent Tech base (à confirmer)
    },
    md: {
      controlHeight: "2.5rem", // 40px — [page] input#searchInput{…height:40px}
      paddingBlock: "0.25rem", // 4px — [page] .id18 a.button-banner{padding:4px 16px}; `padding:4px 16px` is declared 12 times in [page]
      paddingInline: "1rem", // 16px — same declaration
      gap: "0.5rem", // Sent Tech base (à confirmer)
      minWidth: "2.5rem" // Sent Tech base (à confirmer)
    },
    lg: {
      controlHeight: "3rem", // 48px — Sent Tech base (à confirmer)
      paddingBlock: "0.25rem", // 4px — measured block padding, reused (à confirmer)
      paddingInline: "1.5rem", // 24px — [page] body.mobile-filters-open .mobile-filters-footer button{…padding:24px}
      gap: "0.5rem", // Sent Tech base (à confirmer)
      minWidth: "3rem" // Sent Tech base (à confirmer)
    }
  },
  // Typography read from the brand's own control, field and label rules.
  //
  // LINE-HEIGHT. The brand's own control selectors declare NO `line-height`:
  // grepped over input#searchInput, div.dateFilters select, button.btn.btn-search-type,
  // .btn-category-filter, #toggleCategoryFiltersBtn, .mobile-filters-open .resetDateBtn,
  // #choose-cat, .id18 a.button-banner, .menu-column a.cta, .breadcrumb*,
  // .new-pagination*, a.pagination-link, .results-list span.badge-category,
  // .accordion .header-accordion / .content-accordion → 0 hits. So the roles
  // below that have no measurement of their own carry the brand's DOMINANT
  // measured line-height instead. Full inventory over the three brand-owned
  // regions, all units:
  //   1.2em ×13  ← dominant, used here
  //   1.3em ×12, 1.4em ×10, 1.1em ×6, 1.5em ×3, 1.6em ×2, 1.7em ×2, 1em ×2,
  //   1.35em ×1, 1.25em ×1, .9em ×1, 25px ×2, 18px ×1, 14vw ×1, 1.2 ×1,
  //   inherit ×1, 0 ×1
  // The two roles that DO have a measurement keep it: `tabs` 1.4em
  // ([page] .nav-tabs .nav-link{line-height:1.4em}) and `alert` 1.2em
  // ([page] .alert-mail{line-height:1.2em}); `card` keeps its measured 25px.
  typography: {
    // [page] .menu-column a.cta{font-size:16px;font-weight:600;…} and
    // .mobile-filters-footer button{font-family:"Encode Sans",sans-serif;font-size:16px;font-weight:500}
    // and #toggleCategoryFiltersBtn / .btn-category-filter (both 16px / 500):
    // weight 500 is the majority. letterSpacing .02rem is declared 12 times
    // (a.button-banner and the .button-banner-over-image-* family).
    control: {
      family: "'Encode Sans', sans-serif",
      size: "1rem", // 16px
      weight: "500",
      lineHeight: "1.2", // the brand-dominant measured line-height 1.2em (13 declarations)
      letterSpacing: "0.02rem",
      textTransform: "none", // the brand's buttons declare no transform
      textDecoration: "none", // [page] .main-menu ul li a.desktop-menu-button{text-decoration:none}
      decorationThickness: "auto", // Sent Tech base (à confirmer)
      decorationOffset: "auto" // Sent Tech base (à confirmer)
    },
    // [page] input#searchInput{…font-size:16px;font-family:"Encode Sans",sans-serif;font-weight:500}
    // and [mobile] select.category-select{font-size:17px;…font-weight:500}
    field: {
      family: "'Encode Sans', sans-serif",
      size: "1rem", // 16px
      weight: "500",
      lineHeight: "1.2", // brand-dominant measured line-height 1.2em — see `typography` (à confirmer for this role)
      letterSpacing: "0", // the brand's field rules declare none
      textTransform: "none",
      textDecoration: "none",
      decorationThickness: "auto", // Sent Tech base (à confirmer)
      decorationOffset: "auto" // Sent Tech base (à confirmer)
    },
    // [mobile] #choose-cat{display:block;font-size:18px;font-family:"Encode Sans",sans-serif;font-weight:500;color:#505050;height:26px}
    // — the brand's own form label.
    label: {
      family: "'Encode Sans', sans-serif",
      size: "1.125rem", // 18px
      weight: "500",
      lineHeight: "1.2", // brand-dominant measured line-height 1.2em — see `typography` (à confirmer for this role)
      letterSpacing: "0",
      textTransform: "none",
      textDecoration: "none",
      decorationThickness: "auto", // Sent Tech base (à confirmer)
      decorationOffset: "auto" // Sent Tech base (à confirmer)
    },
    // [page] p a,a.stella,div.caption.inside-grid a{color:#243882;font-weight:600}
    // — no decoration at rest; the brand adds it on hover
    // ([page] a.text-grey:hover{…text-decoration:underline}, .sidebar-blue a:hover,
    // a.board-image:hover h3, #menu-lang a.active).
    link: {
      family: "inherit",
      size: "inherit",
      weight: "600",
      lineHeight: "inherit",
      letterSpacing: "0",
      textTransform: "none",
      textDecoration: "none",
      decorationThickness: "auto", // Sent Tech base (à confirmer)
      // NOT the base: the base link declares decorationOffset "0.18em"
      // (packages/tokens/src/foundation.ts). Aligned with the reference theme
      // package's geometry (à confirmer) — the brand publishes no underline
      // offset of its own.
      decorationOffset: "auto",
      textDecorationHover: "underline",
      // NOT the base: the base has no `*Hover` decoration keys at all. Both
      // leaves are aligned with the reference theme package's geometry
      // (à confirmer).
      decorationThicknessHover: "auto",
      decorationOffsetHover: "auto"
    }
  },
  // [page] #mail-alert-container input[type="submit"]:disabled{cursor:default;opacity:.5}
  // — plus button.button-banner:disabled, .arrow-disable and the disabled
  // search button, all at opacity .5.
  disabledOpacity: "0.5",
  transition: {
    // the Sent Tech base property list, kept as-is (à confirmer): the brand
    // declares per-property transitions, never a shared list.
    property: "background-color, border-color, color, box-shadow, outline-color",
    // The brand's DOMINANT measured duration: `.3s`, 7 declarations across the
    // brand-owned regions ([page] .menu-column.column-menu-3, .megamenu-container.active,
    // .cta-id46-main a, .cta-id46-main p a::after, .id47.sticky-c47,
    // .id47 .scroll-button; [mobile] .second-level-menu>li>a>i). A single `.4s`
    // exists — [page] #autocomplete-container li{…transition:background-color .4s ease}
    // — but it is scoped to one autocomplete list item, so the least-scoped /
    // most frequent value wins for this shared interaction token. Recorded in
    // MAPPING.md as context.
    duration: "300ms",
    easing: "ease" // the brand's dominant easing function (15 declarations)
  },
  cursor: {
    interactive: "pointer", // [page] .menu-column a.cta{…cursor:pointer}
    disabled: "not-allowed", // [site] .megamenu.disabled>a:hover,…{…cursor:not-allowed}
    text: "text" // Sent Tech base (à confirmer) — the brand declares no text cursor
  },
  // The brand publishes exactly ONE square icon box, and it is 20px:
  // [mobile] .select-icon::after{…width:20px;height:20px;…} and
  // [page] button.lang-button.btn[aria-expanded="true"]::before{…width:20px;height:20px;…}
  // (grep for `width:16px` and for a square `width:24px;height:24px` over the
  // three brand-owned regions → 0 hits). `md` is therefore measured; `sm` and
  // `lg` are DERIVED by stepping that measured box on the brand's own 4px grid
  // (16 / 20 / 24px). Neither derived step is the Sent Tech base, whose scale is
  // 1rem / 1.125rem / 1.25rem: `sm` happens to coincide with the base, `lg`
  // does NOT — 1.5rem is neither the base nor the reference theme package's
  // 1.25rem, it is this 4px step (à confirmer). Taking the base 1.25rem for `lg`
  // was rejected because it would collapse `lg` onto the measured `md`.
  iconSize: {
    sm: "1rem", // 16px — 4px step down; coincides with the Sent Tech base (à confirmer)
    md: "1.25rem", // 20px — measured, 2 square declarations
    lg: "1.5rem" // 24px — 4px step up; NOT the base (1.25rem) (à confirmer)
  },
  // FOCUS = an OUTLINE. The brand's least-scoped keyboard-focus rule is
  // [site] .using-keyboard :focus,…{outline:dashed;outline-color:#bbb;outline-width:1px;outline-offset:-2px;border-radius:2px}
  // — a universal `:focus` descendant, so site-wide. The declared TECHNIQUE
  // (`outline`) and its width/offset are transcribed. Its COLOUR `#bbb` is
  // 1.92:1 on white and fails the 3:1 non-text floor, so the colour is routed
  // to the brand's other measured focus outline colour:
  // [site] a.sr-only.sr-only-focusable.skip-style{…outline-color:#243882;outline-width:2px;…}
  // (10.70:1 on white). `outline:dashed` has no primitive to carry it — see MAPPING.md.
  focus: {
    strategy: "outline",
    width: "1px",
    offset: "-2px",
    color: stellantisColor.blue.primary, // #243882 — routed, see MAPPING.md
    inset: "0" // unused by the `outline` strategy — Sent Tech base (à confirmer)
  },
  // FIELDS are BOXED (outline): four equal 1px #d3d3d3 borders and radius 0.
  // On the brand's ACTUAL form fields the count is 2 against 2, not 6 against 2:
  //   boxed, four equal borders — [page] input#searchInput{border:1px solid #d3d3d3;
  //     …;border-radius:0;height:40px} and div.dateFilters select{border-radius:0;
  //     …;height:40px;border:1px solid #d3d3d3}
  //   bottom-only — [page] input.input-mail{…border-bottom-width:1px;border-color:#243882}
  //     and [mobile] select.category-select{…border-bottom:1px solid #243882;border-top:0…}
  // The four other `1px solid #d3d3d3` selectors are NOT fields:
  // button.btn.btn-search-type[aria-pressed="false"], .mobile-filters-open .resetDateBtn
  // and #category-filters-group .btn-category-filter are buttons/chips, and
  // div.category-filters-group is a flex CONTAINER with a bottom rule only.
  // `outline` is chosen on three measured grounds instead of that margin: the
  // boxed pair carries the brand's radius 0 and its 40px control box, the
  // bottom-only pair does not; and the least-scoped of the four
  // (`input#searchInput`, the site search) is boxed.
  field: {
    style: "outline",
    // #ffffff. The search field's own fill is rgba(240,240,240,0.3), which
    // composites to roughly #fafafa over white (à confirmer). Two of the boxed
    // controls declare a white fill outright — [page] .mobile-filters-open
    // .resetDateBtn{…background:#fff} and #toggleCategoryFiltersBtn[aria-expanded="false"]
    // {background-color:#fff} — which supports surface.default here.
    fillBg: stellantisColor.grey[0],
    underlineColor: stellantisColor.grey.line, // #d3d3d3 — unused for outline, kept for completeness
    underlineWidth: "1px",
    // [mobile] select.category-select{…-webkit-appearance:none;appearance:none;…}
    selectAppearance: "none",
    // The brand draws its select chevron as a Font Awesome glyph
    // ([mobile] .select-icon::after{…content:"\f13a";font-family:"Font Awesome 5 Pro";color:#243882}),
    // and this package embeds no icon binary. Only the FILL is measured — the
    // brand blue #243882. The vector itself is byte-identical to the reference
    // theme package's chevron, so it is aligned with the reference theme
    // package's geometry, not drawn from the brand (à confirmer). The `0.5rem`
    // inset has NO brand source either: the brand positions its glyph at
    // `right:5%`, which this shorthand cannot carry (à confirmer).
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23243882' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.5rem center",
    selectPaddingRight: "1.5rem" // 24px — [mobile] select.category-select{…padding-inline-end:24px}
  },
  // CARDS are BORDERLESS and square: [page] .id38b .card{border-width:0;background:transparent},
  // .card-container-c42 .card{border-radius:0;border:0;…;background-color:transparent},
  // .id38b .card.open-gallery-item{border:0}.
  card: {
    borderWidth: "0",
    lineHeight: "1.5625rem", // 25px — [page] .card-container-c42 .card-title-c42{…line-height:25px} and p.card-text{…line-height:25px}
    hoverBackground: stellantisColor.grey.page // #f0f0f0 — [mobile] select.category-select:hover{background:#f0f0f0}; card hover ROLE assignment à confirmer
  },
  // SECONDARY BUTTON = white fill, blue 1px border, blue label:
  // [page] .id18 a.button-banner{padding:4px 16px;background:#fff;color:#243882;border:1px solid #243882}
  // — the fill, the border and the label all come from that one declaration.
  // [page] #mail-alert-container input[type="submit"] corroborates the blue
  // label and the blue 1px border only; its own fill is `background:#efefef`,
  // so it is NOT cited for the white background. `#efefef` is a measured brand
  // hex that no role in this package carries (see MAPPING.md).
  buttonSecondary: {
    background: stellantisColor.grey[0], // #ffffff
    border: stellantisColor.blue.primary, // #243882
    hoverBackground: stellantisColor.grey.page // #f0f0f0 — [mobile] select.category-select:hover{background:#f0f0f0}; hover ROLE assignment à confirmer
  },
  // TABS: [page] .nav-tabs .nav-link,.nav-tabs .nav-link.active,.nav-tabs .nav-link:hover{color:#505050;background:transparent;text-transform:uppercase;text-align:center;font-weight:500;line-height:1.4em;padding:0 .5em;font-size:17px;margin-bottom:15px;border:0;border-radius:0;border-color:#505050;border-left:1px solid}
  // and .nav-tabs .nav-link.active{color:#243882;border-color:#243882}.
  // The brand's active indicator is a LEFT 1px divider recoloured to #243882,
  // which `indicatorSide` cannot express (it resolves to top|bottom only), so
  // the closest expressible form is used (à confirmer) — see MAPPING.md.
  tabs: {
    activeText: stellantisColor.blue.primary, // #243882
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0", // padding:0 .5em
    paddingInline: "0.5em", // padding:0 .5em
    fontSize: "1.0625rem", // 17px
    lineHeight: "1.4", // line-height:1.4em
    indicatorSide: "bottom", // brand draws a LEFT divider (à confirmer)
    indicatorMode: "border"
  },
  // PAGINATION: [page] .new-pagination{font-family:"Encode Sans",sans-serif;font-size:20px;font-weight:500},
  // .new-pagination .page-link{background:transparent;border:0},
  // .new-pagination .page-item a{color:#d3d3d3}, .new-pagination .page-item.active span{color:#505050},
  // a.pagination-link{margin:5px;color:#505050;text-decoration:none}.
  // The brand serves two paginators: the #d3d3d3 resting link is 1.50:1 on
  // white and fails the 4.5:1 text floor, so the resting text takes the other
  // measured pagination colour #505050 (8.06:1) and #d3d3d3 is kept for the
  // disabled role, where it is the brand's own de-emphasis value.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: stellantisColor.grey.body, // #505050
    activeBackground: "transparent",
    // #243882 — the brand's measured active-state colour across its own
    // navigation ([page] .nav-tabs .nav-link.active{color:#243882},
    // div#lang-form-wrapper a.active{color:#243882}); pagination ROLE assignment à confirmer.
    activeText: stellantisColor.blue.primary,
    activeBorderWidth: "0",
    disabledText: stellantisColor.grey.line, // #d3d3d3 — .new-pagination .page-item a
    paddingBlock: "0", // the brand's paginator declares no padding (à confirmer)
    paddingInline: "0.3125rem", // 5px — derived from the measured margin:5px gap (à confirmer)
    minSize: "2.5rem", // 40px — the brand's measured control height (à confirmer for this role)
    fontSize: "1.25rem", // 20px — .new-pagination{font-size:20px}
    lineHeight: "1.2" // brand-dominant measured line-height 1.2em — see `typography` (à confirmer for this role)
  },
  // BREADCRUMB: [page] .breadcrumb{font-family:"Encode Sans",sans-serif;padding:15px 0;margin:0;border-radius:0;background-color:transparent;height:50px},
  // .breadcrumb-item{font-size:12px}, .breadcrumb a{color:#243882;font-weight:500},
  // .breadcrumb-item.bcarrow:after{…padding:0 8px;color:#243882;content:"\f054";…},
  // .breadcrumb-item.active{color:#505050;font-weight:400}.
  breadcrumb: {
    linkText: stellantisColor.blue.primary, // #243882
    text: stellantisColor.grey.body, // #505050
    currentText: stellantisColor.grey.body, // #505050
    separator: stellantisColor.blue.primary, // #243882
    fontSize: "0.75rem", // 12px
    lineHeight: "1.2", // brand-dominant measured line-height 1.2em — see `typography` (à confirmer for this role)
    currentWeight: "400"
  },
  // ALERT: the brand's own alert is a bare coloured text line, not a box —
  // [page] .alert-mail{color:#d85935;display:block;padding-top:5px;line-height:1.2em}.
  // No fill, no border, no accent bar is declared, so every box leaf is zeroed
  // (measured as absent, à confirmer) and only the 5px top padding and the
  // 1.2em line-height are transcribed.
  alert: {
    background: "transparent", // measured as absent (à confirmer)
    borderTop: "none", // measured as absent (à confirmer)
    borderRight: "none", // measured as absent (à confirmer)
    borderBottom: "none", // measured as absent (à confirmer)
    accentWidth: "0", // measured as absent (à confirmer)
    filetWidth: "0", // measured as absent (à confirmer)
    paddingTop: "0.3125rem", // 5px — padding-top:5px
    paddingRight: "0", // measured as absent (à confirmer)
    paddingBottom: "0", // measured as absent (à confirmer)
    paddingLeft: "0", // measured as absent (à confirmer)
    // 16px. NOT the Sent Tech base: the base publishes no `alert` block at all
    // (packages/tokens/src/foundation.ts). Aligned with the reference theme
    // package's geometry (à confirmer) — .alert-mail declares no font-size.
    fontSize: "1rem",
    lineHeight: "1.2" // line-height:1.2em
  },
  // ACCORDION: [page] .accordion .header-accordion,.accordion .content-accordion{padding:0 .75rem 0 30px}
  // and .style-accordion a,.accordion a{color:#243882}.
  accordion: {
    text: stellantisColor.blue.primary, // #243882
    paddingBlock: "0", // padding:0 .75rem 0 30px
    paddingInline: "0.75rem", // .75rem
    fontSize: "1.125rem", // 18px — the brand's measured body size ([page] p{font-size:18px}) (à confirmer for this role)
    fontWeight: "600", // [page] p b{font-weight:600} / .style-accordion emphasis (à confirmer for this role)
    lineHeight: "1.2" // brand-dominant measured line-height 1.2em — see `typography` (à confirmer for this role)
  },
  // TAG / filter chip: [page] #category-filters-group .btn-category-filter{border:1px solid #d3d3d3;padding:4px 8px;height:42px},
  // .btn-category-filter{padding-bottom:8px;font-family:"Encode Sans",sans-serif;font-size:16px;font-weight:500;color:#505050},
  // #toggleCategoryFiltersBtn[aria-expanded="false"]{background-color:#fff;…;border-color:#d3d3d3}.
  tag: {
    radius: "0", // border-radius:0 — the brand's 51-declaration default
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "1rem", // 16px
    fontWeight: "500",
    lineHeight: "1.2", // brand-dominant measured line-height 1.2em — see `typography` (à confirmer for this role)
    minHeight: "2.625rem", // 42px — height:42px
    neutralBackground: stellantisColor.grey[0], // #ffffff
    neutralText: stellantisColor.grey.body // #505050
  },
  // BADGE: [page] .results-list span.badge-category{color:#243882;font-family:"Encode Sans Condensed",sans-serif;font-size:12px;font-weight:500;text-transform:uppercase;display:inline-block;margin-bottom:18px}
  // — an uppercase blue label with no fill, no border and no padding.
  badge: {
    radius: "0", // the brand's 51-declaration default radius (à confirmer for this role)
    paddingBlock: "0", // measured as absent (à confirmer)
    paddingInline: "0", // measured as absent (à confirmer)
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1.2", // brand-dominant measured line-height 1.2em — see `typography` (à confirmer for this role)
    textTransform: "uppercase",
    minHeight: "0", // measured as absent (à confirmer)
    infoBackground: "transparent", // measured as absent (à confirmer)
    infoText: stellantisColor.blue.primary // #243882
  },
  // CHOICE label: [mobile] #choose-cat{display:block;font-size:18px;font-family:"Encode Sans",sans-serif;font-weight:500;color:#505050;height:26px}
  // — the brand's own form label (no checkbox/radio rule exists on the
  // corporate host; the second host's .form-check rule is reported as context
  // in MAPPING.md, not used).
  choice: {
    labelFontSize: "1.125rem", // 18px
    labelLineHeight: "1.2", // brand-dominant measured line-height 1.2em (à confirmer for this role)
    radioLineHeight: "1.2", // same (à confirmer)
    labelColor: stellantisColor.grey.body // #505050
  },
  // SEARCH: [page] input#searchInput{border:1px solid #d3d3d3;background:rgba(240,240,240,0.3);padding:4px 0 4px 12px;border-radius:0;height:40px;font-size:16px;font-family:"Encode Sans",sans-serif;font-weight:500;color:#505050}
  search: {
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px (padding-left:12px)
    fontSize: "1rem", // 16px
    lineHeight: "1.2" // brand-dominant measured line-height 1.2em — see `typography` (à confirmer for this role)
  },
  // TOGGLE: the brand publishes no switch on either host, so only the label
  // colour is measured. The track geometry is NOT the Sent Tech base either —
  // the base publishes no `toggle` block at all
  // (packages/tokens/src/foundation.ts). `trackPadding` is aligned with the
  // reference theme package's geometry, which declares "0", as do both
  // reference implementations (à confirmer). The previous "0.125rem" came from
  // neither the base nor a reference package and is dropped.
  toggle: {
    trackPadding: "0", // aligned with the reference theme package (à confirmer)
    lineHeight: "1.2", // brand-dominant measured line-height 1.2em — see `typography` (à confirmer for this role)
    textColor: stellantisColor.grey.body // #505050 — [page] p{color:#505050}
  }
} as const;

// --- semantic (Stellantis-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: stellantisColor.grey[0], // #ffffff — [page] body.no-front #container-overlay{background:#fff}
    subtle: stellantisColor.grey.page, // #f0f0f0 — [site] .bg-grey-page{background-color:#f0f0f0}
    raised: stellantisColor.grey[0], // #ffffff — [page] .megaOn #primary-menu{background-color:#fff}
    inverse: stellantisColor.anthracite.base, // #282b34 — [site] .corporate-dark-blue{background:#282b34}
    // DERIVED (à confirmer). The brand's own `.modal-backdrop` rule declares
    // ONLY a z-index ([page] body.modal-open.megaOn .modal-backdrop{z-index:800});
    // the backdrop colour comes solely from Bootstrap's vendor block
    // (clientlib-vendors: .modal-backdrop{--bs-backdrop-bg:#000;--bs-backdrop-opacity:0.5}),
    // which step 0.5 excludes. This is the brand anthracite #282b34 at the 0.5
    // alpha the brand itself uses on that colour
    // ([page] .id47.bg-anthracite .scroll-button.left{…rgba(40,43,52,0.5) 73%}).
    overlay: "rgb(40 43 52 / 0.5)"
  },
  text: {
    primary: stellantisColor.grey.body, // #505050 — [page] p{font-size:18px;color:#505050;font-weight:400} (8.06:1 on white)
    secondary: stellantisColor.grey.mid, // #6a6a6a — [page] .results-list p.results-excerpt{color:#6a6a6a} (5.41:1)
    // stop-rule result (à confirmer): start [site] .clear-grey-stella{color:#a0a0a0}
    // (2.61:1, fails 4.5:1) → 4 steps → #6d6d6d (5.17:1). Chain in MAPPING.md.
    muted: stellantisColor.grey.mutedText,
    inverse: stellantisColor.grey[0], // #ffffff — [site] .corporate-dark-blue{…color:#fff}
    link: stellantisColor.blue.primary // #243882 — [page] p a,a.stella,…{color:#243882;font-weight:600} (10.70:1)
  },
  border: {
    subtle: stellantisColor.grey.line, // #d3d3d3 — [page] input#searchInput{border:1px solid #d3d3d3}
    strong: stellantisColor.grey.body, // #505050 — [page] .border-top-bottom{border-top:1px solid #505050;border-bottom:1px solid #505050}
    interactive: stellantisColor.blue.primary // #243882 — [page] #searchInput:focus{…border-color:#243882} (10.70:1, passes the 3:1 line floor)
  },
  action: {
    primary: stellantisColor.blue.primary, // #243882 — [page] .bg-blue-stellantis{background-color:#243882}
    primaryHover: stellantisColor.blue.deep, // #1c2d65 — [page] .gradient-background-blue deep stop; hover ROLE assignment à confirmer
    primaryText: stellantisColor.grey[0], // #ffffff — [page] .column-menu-1{background-color:#243882;color:white} (10.70:1)
    secondary: stellantisColor.grey.page, // #f0f0f0 — [site] .bg-grey{background:#f0f0f0}
    // #d3d3d3 — the brand's next neutral step ([page] input#searchInput border);
    // secondary :hover ROLE assignment à confirmer.
    secondaryHover: stellantisColor.grey.line,
    secondaryText: stellantisColor.blue.primary, // #243882 — [page] .id18 a.button-banner{background:#fff;color:#243882;…} (9.39:1 on #f0f0f0)
    danger: stellantisColor.system.error // #cc4c27 — stop-rule from [page] .alert-mail{color:#d85935} (à confirmer)
  },
  feedback: {
    success: stellantisColor.accent.mintDark, // #006e6a — [page] .mint-dark; success ROLE assignment à confirmer
    warning: stellantisColor.system.warning, // #c63a14 — stop-rule from .tangerine #e94e24 (à confirmer)
    error: stellantisColor.system.error, // #cc4c27 — stop-rule from .alert-mail #d85935 (à confirmer)
    info: stellantisColor.blue.primary // #243882 — .bg-blue-stellantis; info ROLE assignment à confirmer
  },
  status: {
    pending: stellantisColor.system.warning, // #c63a14 (à confirmer)
    processing: stellantisColor.blue.primary, // #243882
    completed: stellantisColor.accent.mintDark, // #006e6a (à confirmer)
    failed: stellantisColor.system.error // #cc4c27 (à confirmer)
  },
  // Categorical data-vis palette. Every hex is a MEASURED brand colour from the
  // named utility palette; the 8-slot ORDER is a proposal (à confirmer) —
  // Stellantis publishes no sequential or categorical scale.
  data: {
    category1: stellantisColor.blue.primary, // #243882 .corporate-blue
    category2: stellantisColor.accent.tangerine, // #e94e24 .tangerine
    category3: stellantisColor.accent.mint, // #43aaa0 .mint
    category4: stellantisColor.accent.mintDark, // #006e6a .mint-dark
    category5: stellantisColor.blue.tint50, // #7b88b4 .corporate-blue-50
    category6: stellantisColor.accent.mintLight, // #a0d4cd .mint-light
    category7: stellantisColor.anthracite.base, // #282b34 .anthracite
    category8: stellantisColor.grey.mid // #6a6a6a .results-excerpt grey
  }
} as const;

/**
 * The Stellantis theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Stellantis-specific values and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent`, so the corporate blue and the brand's square, borderless
 * geometry reach the components — not only the elements that read semantic vars.
 */
export const stellantisTheme: TenantTheme = {
  id: "stellantis",
  label: "Stellantis",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default stellantisTheme;
