import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Carrefour brand theme for the Sentropic token structure.
 *
 * Carrefour SA (CA / FR0000120172, CAC 40, head office Massy) serves TWO fronts
 * with DIFFERENT declared values. This package is a MEASURED-CLONE of the
 * retail front `carrefour.fr`, which ships Carrefour's own TOKENISED design
 * system: 2551 `--ds-*` custom-property declarations in
 * `https://www.carrefour.fr/v3-assets/HHNlKr0TBF.css`, including an explicit
 * brand layer (`--ds-color-brand-primary/-secondary/-tertiary`), radius,
 * spacing, sizing, shadow and opacity scales, and per-component colour roles.
 * The corporate front `carrefour.com` declares ZERO custom properties — it is a
 * Drupal theme (`/themes/custom/c4com/css/app.css`) whose values are literal
 * hexes, and roughly a quarter of that file is normalize.css v8.0.1, a Tailwind
 * v1 preflight + utility layer, Swiper and video.js. Source rank therefore puts
 * carrefour.fr first: a published tokenised design system outranks literal
 * hexes in a site stylesheet. The host disagreement, the per-file counts and the
 * arbitration are recorded in MAPPING.md.
 *
 * Reference-`rem` root: `body,html{font-size:16px}` — declared explicitly on
 * carrefour.fr, so every transcribed length is a 16px-root length and needs no
 * conversion. Only font *names* are referenced, never binaries.
 *
 * Carrefour colour reference (all values below are `--ds-*` declarations of
 * `https://www.carrefour.fr/v3-assets/HHNlKr0TBF.css` unless marked derived):
 *   Action blue                 #0970e6  --ds-color-interactive-active-main-primary (162 occurrences)
 *   Action blue hover           #004e9b  --ds-color-interactive-active-main-hover family
 *   Action blue pressed         #003161  --ds-color-interactive-background-button-filled-main-pressed
 *   Declared brand primary      #254f9a  --ds-color-brand-primary (declared, never consumed)
 *   Declared brand secondary    #c20016  --ds-color-brand-secondary (declared, never consumed)
 *   Loyalty blue                #004f9b  --ds-color-interactive-active-loyalty-primary
 *   Content primary (near-black) #121212 --ds-color-core-content-main-primary (187 occurrences)
 *   Content secondary           #454545  --ds-color-core-content-main-secondary
 *   Content tertiary            #575757  --ds-color-core-content-main-tertiary
 *   Input border                #d9d9d9  --ds-color-interactive-border-input-active
 *   Input border pressed        #878787  --ds-color-interactive-border-input-pressed
 *   Background secondary        #f7f7f7  --ds-color-core-background-main-secondary
 *   Separator                   #ebebeb  --ds-color-persistent-border-main-primary
 *   Negative / danger           #df1116  --ds-color-persistent-background-functional-main-negative
 *   Success                     #2c815e  --ds-color-persistent-background-functional-main-success
 *   Warning                     #8a5f00  --ds-color-persistent-background-functional-main-warning
 *   Information                 #173eb4  --ds-color-persistent-background-functional-main-information
 */

// --- Carrefour raw measured palette ----------------------------------------
// Every entry cites the `--ds-*` custom property that declares it in
// https://www.carrefour.fr/v3-assets/HHNlKr0TBF.css (the `:root` blocks), or
// the brand CSS rule that declares the literal value.
const carrefourColor = {
  // Carrefour's OPERATIVE action family. `--ds-color-brand-primary` (#254f9a)
  // is declared in the same `:root` block but is consumed by NO rule
  // (0 `var()` references); the blue that actually paints buttons, links,
  // focus rings, selected tabs and checked toggles is #0970e6 (162 declared
  // occurrences, 11 `var()` consumptions). Occurrence frequency decides.
  action: {
    primary: "#0970e6", // --ds-color-interactive-active-main-primary / --ds-color-interactive-background-button-filled-main-active
    hover: "#004e9b", // --ds-color-interactive-background-button-filled-main-hover
    pressed: "#003161", // --ds-color-interactive-background-button-filled-main-pressed
    tabSelected: "#0864e6", // --ds-color-interactive-text-tab-selected-active
    light: "#f5faff" // --ds-color-core-background-functional-information / --ds-color-decorative-background-main-celeste
  },
  // The DS's DECLARED brand layer. Kept because it is the brand's own
  // self-description, even though no rule consumes it.
  brand: {
    primary: "#254f9a", // --ds-color-brand-primary (declared; 0 var() consumptions)
    secondary: "#c20016", // --ds-color-brand-secondary (declared; 0 var() consumptions)
    tertiary: "#f0f3f6", // --ds-color-brand-tertiary / --ds-color-decorative-background-main-casper
    loyalty: "#004f9b" // --ds-color-interactive-active-loyalty-primary (Carrefour card blue)
  },
  // Neutral ramp, all measured.
  neutral: {
    0: "#ffffff", // --ds-color-core-background-main-primary / body,html{background-color:#fff}
    50: "#f7f7f7", // --ds-color-core-background-main-secondary / --ds-color-persistent-background-alternate
    100: "#ebebeb", // --ds-color-persistent-border-main-primary / --ds-separator
    200: "#e5e5e5", // --ds-color-core-border-main-primary
    300: "#d9d9d9", // --ds-color-interactive-border-input-active / --ds-color-core-border-main-secondary
    400: "#b8b8b8", // --ds-color-interactive-border-input-hover
    500: "#878787", // --ds-color-interactive-border-input-pressed
    600: "#575757", // --ds-color-core-content-main-tertiary
    700: "#454545", // --ds-color-core-content-main-secondary / --ds-color-interactive-text-input-label-default
    800: "#262626", // --ds-color-core-background-reversed-secondary / --ds-color-decorative-background-reversed-charcoal
    900: "#121212" // --ds-color-core-content-main-primary / --ds-color-core-background-reversed-primary
  },
  // Functional / system colours, all measured.
  system: {
    success: "#2c815e", // --ds-color-persistent-background-functional-main-success
    warning: "#8a5f00", // --ds-color-persistent-background-functional-main-warning
    error: "#df1116", // --ds-color-persistent-background-functional-main-negative
    info: "#173eb4", // --ds-color-persistent-background-functional-main-information
    successLight: "#f0faf6", // --ds-color-persistent-background-functional-reversed-success
    warningLight: "#fffaf0", // --ds-color-persistent-background-functional-reversed-warning
    errorLight: "#ffefef", // --ds-color-persistent-background-functional-reversed-negative
    infoLight: "#f5faff" // --ds-color-core-background-functional-information
  },
  // Decorative accent family — the DS's `--ds-color-decorative-*` scale.
  decorative: {
    aqua: "#edfdff", // --ds-color-decorative-background-main-aqua
    sacramento: "#006064", // --ds-color-decorative-background-reversed-sacramento
    sacramentoDeep: "#00484a", // derived: one HSL L-0.05 step from #006064 (à confirmer)
    royal: "#173eb4", // --ds-color-decorative-background-reversed-royal
    forest: "#004f2b", // --ds-color-decorative-background-reversed-forest
    ginger: "#b33308", // --ds-color-decorative-background-reversed-ginger
    raisin: "#4a148c", // --ds-color-decorative-background-reversed-raisin
    olive: "#827717", // --ds-color-decorative-background-reversed-olive
    walnut: "#5c2e1d", // --ds-color-decorative-background-reversed-walnut
    graphite: "#263238" // --ds-color-decorative-background-reversed-graphite
  }
} as const;

// --- foundation (Carrefour-specific values) --------------------------------
const foundation = {
  color: {
    // Carrefour IS a blue brand: the Sentropic "blue" role family carries the
    // measured action blue and its declared hover/pressed steps.
    blue: {
      10: carrefourColor.action.light, // #f5faff --ds-color-core-background-functional-information
      60: carrefourColor.action.primary, // #0970e6 --ds-color-interactive-active-main-primary
      80: carrefourColor.action.pressed // #003161 --ds-color-interactive-background-button-filled-main-pressed
    },
    // Carrefour's DS declares no cyan ACTION family; the Sentropic "cyan"
    // accent slot carries the decorative aqua/sacramento teal pair.
    cyan: {
      10: carrefourColor.decorative.aqua, // #edfdff --ds-color-decorative-background-main-aqua
      50: carrefourColor.decorative.sacramento, // #006064 --ds-color-decorative-background-reversed-sacramento
      70: carrefourColor.decorative.sacramentoDeep // #00484a derived darker teal (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the measured neutral ramp.
    slate: {
      0: carrefourColor.neutral[0], // #ffffff
      10: carrefourColor.neutral[50], // #f7f7f7 background secondary
      20: carrefourColor.neutral[300], // #d9d9d9 input border — feeds border.subtle / the field stroke
      60: carrefourColor.neutral[600], // #575757 content tertiary
      80: carrefourColor.neutral[800], // #262626 background reversed secondary
      90: carrefourColor.neutral[900] // #121212 content primary / background reversed primary
    },
    feedback: {
      success: carrefourColor.system.success, // #2c815e
      warning: carrefourColor.system.warning, // #8a5f00
      error: carrefourColor.system.error, // #df1116
      info: carrefourColor.system.info // #173eb4
    }
  },
  // Body face from `body,html{font-family:Open Sans,cf-body-fallback,…}`;
  // display face from `h1,h2,h3,h4,h5,h6{font-family:Ubuntu,Open Sans,
  // cf-heading-fallback,sans-serif}`. `--ds-font-family` is
  // `"Ubuntu","Open Sans","sans-serif"`. `cf-body-fallback` /
  // `cf-heading-fallback` are Carrefour's own metric-matched fallback faces,
  // declared via @font-face; we reference the NAMES only, never binaries.
  // Carrefour publishes no monospace face — mono is a system stack
  // (à confirmer).
  font: {
    sans: "'Open Sans', 'cf-body-fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    display: "'Ubuntu', 'Open Sans', 'cf-heading-fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" // à confirmer — Carrefour declares no monospace face
  },
  // Measured from the `--ds-spacing-*` scale (16px root, no conversion needed):
  // xxxs .125rem, xxs .25rem, xs .5rem, s .75rem, m 1rem, l 1.5rem, xl 2rem,
  // xxl 3rem, xxxl 8rem. The Sentropic key `16` means 4rem; Carrefour's scale
  // jumps from 3rem to 8rem and publishes no 4rem step, so `16` is derived.
  spacing: {
    0: "0",
    1: "0.25rem", // --ds-spacing-xxs
    2: "0.5rem", // --ds-spacing-xs
    3: "0.75rem", // --ds-spacing-s
    4: "1rem", // --ds-spacing-m
    6: "1.5rem", // --ds-spacing-l
    8: "2rem", // --ds-spacing-xl
    12: "3rem", // --ds-spacing-xxl
    16: "4rem" // derived — Carrefour's scale has no 4rem step (à confirmer)
  },
  // Measured from `--ds-border-radius-*`: 4 = .25rem, 8 = .5rem, 16 = 1rem,
  // 24 = 1.5rem, 32 = 2rem, 100 = 6.25rem. Buttons, inputs, cards, tags and
  // links all use radius-4 — Carrefour is a lightly-rounded brand.
  radius: {
    none: "0",
    sm: "0.25rem", // --ds-border-radius-4
    md: "0.25rem", // --ds-border-radius-4 — .c-button / .c-base-input__container / .c-card
    lg: "0.5rem", // --ds-border-radius-8 — .c-modal__container
    pill: "6.25rem" // --ds-border-radius-100 — .c-radio__label:before / .c-toggle__handle
  },
  // Measured from `--ds-shadow-*`, all tinted with the brand near-black
  // rgba(18,18,18,…) = #121212.
  shadow: {
    subtle: "0px 2px 4px rgba(18, 18, 18, 0.08)", // --ds-shadow-up-xs
    medium: "2px 4px 12px rgba(18, 18, 18, 0.12)", // --ds-shadow-action
    floating: "0px 16px 64px rgba(18, 18, 18, 0.12), 0px 8px 24px rgba(18, 18, 18, 0.16)" // --ds-shadow-raised / --ds-shadow-up-l
  },
  // Durations measured by frequency across the DS component rules: .3s (53
  // occurrences, e.g. `.c-button{transition:background-color .3s,color .3s}`),
  // .2s (28, e.g. `.c-input-file__remove-button{transition:background-color .2s
  // ease-in-out}`), .5s (9). The easing is the DS's only NAMED easing variable,
  // `--accordion-animation-easing`, declared on `.c-accordion`.
  motion: {
    fast: "200ms", // .2s
    normal: "300ms", // .3s — the dominant DS duration
    slow: "500ms", // .5s
    easing: "cubic-bezier(0.4, 0, 0.2, 1)" // .c-accordion{--accordion-animation-easing}
  },
  // Measured stacking order: `.mainbar--sticky{z-index:10005}`,
  // `.c-modal{z-index:18000}` (= `.c-drawer`), `.c-toaster{z-index:22000}`.
  // Carrefour draws its backdrop as `.c-modal:before{z-index:-1}` INSIDE the
  // modal layer, so it publishes no standalone overlay z-index; `overlay` and
  // `chat` are derived to keep the measured order (à confirmer).
  z: {
    header: 10005, // .mainbar--sticky
    toast: 22000, // .c-toaster
    overlay: 17999, // derived — one step under the measured modal layer (à confirmer)
    modal: 18000, // .c-modal / .c-drawer
    chat: 22001 // derived — one step over the measured toast layer (à confirmer)
  },
  // --- Anatomy primitives (Carrefour) --------------------------------------
  // Measured from `--ds-border-size-1: .0625rem` (1px) and
  // `--ds-border-size-2: .125rem` (2px).
  borderWidth: {
    none: "0",
    thin: "0.0625rem", // --ds-border-size-1 (1px) — .c-base-input__container / .c-card border
    thick: "0.125rem" // --ds-border-size-2 (2px) — .c-tabs__tab border / focus outline
  },
  borderStyle: { solid: "solid" },
  // Control density MEASURED from Carrefour's own button rules:
  //   .c-button--size-s{padding:var(--ds-spacing-xs) var(--ds-spacing-m);height:40px}
  //   .c-button--size-m{padding:var(--ds-spacing-m) var(--ds-spacing-xl);height:56px}
  // gap from `.c-button__content{gap:var(--ds-spacing-xxs)}`; fontSize from
  // `.c-button{font-size:1rem}` and
  // `.c-button--variation-tertiary-small{font-size:.875rem}`.
  // Carrefour publishes only TWO button sizes, so `lg`, and every `minWidth`,
  // are derived (à confirmer).
  density: {
    sm: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.25rem", minWidth: "2.5rem", fontSize: "0.875rem" }, // 40px measured; minWidth à confirmer
    md: { controlHeight: "3.5rem", paddingBlock: "1rem", paddingInline: "2rem", gap: "0.25rem", minWidth: "3.5rem", fontSize: "1rem" }, // 56px measured; minWidth à confirmer
    lg: { controlHeight: "4rem", paddingBlock: "1rem", paddingInline: "2rem", gap: "0.25rem", minWidth: "4rem", fontSize: "1rem" } // derived — no third size published (à confirmer)
  },
  // Typography MEASURED from the DS component rules:
  //   control: .c-button{font-size:1rem;font-weight:700;line-height:1.5rem}
  //   field:   .c-base-input__input{font-size:1rem;font-weight:400;line-height:1.375}
  //   label:   .c-base-input__label{font-size:.875rem;font-weight:400}
  //   link:    .c-link{text-decoration:none;font-weight:400} +
  //            .c-link--size-m{font-size:1rem;line-height:24px} +
  //            .c-link--underline{text-decoration:underline;text-underline-offset:3px}
  typography: {
    control: {
      family: "var(--st-font-display)", // .c-button{font-family:var(--ds-font-family)} = Ubuntu first
      size: "1rem",
      weight: "700",
      lineHeight: "1.5",
      letterSpacing: "0",
      textTransform: "none",
      textDecoration: "none",
      decorationThickness: "auto",
      decorationOffset: "auto"
    },
    field: {
      family: "var(--st-font-sans)",
      size: "1rem",
      weight: "400",
      lineHeight: "1.375",
      letterSpacing: "0",
      textTransform: "none",
      textDecoration: "none",
      decorationThickness: "auto",
      decorationOffset: "auto"
    },
    label: {
      family: "var(--st-font-sans)",
      size: "0.875rem",
      weight: "400",
      lineHeight: "1.4", // derived — .c-base-input__label declares no line-height (à confirmer)
      letterSpacing: "0",
      textTransform: "none",
      textDecoration: "none",
      decorationThickness: "auto",
      decorationOffset: "auto"
    },
    // Carrefour links are NOT underlined at rest: `.c-link{text-decoration:none}`.
    // The underline is an opt-in modifier, so it is carried on hover.
    link: {
      family: "inherit",
      size: "inherit",
      weight: "400",
      lineHeight: "inherit",
      letterSpacing: "0",
      textTransform: "none",
      textDecoration: "none",
      decorationThickness: "auto",
      decorationOffset: "3px", // .c-link--underline{text-underline-offset:3px}
      textDecorationHover: "underline",
      decorationThicknessHover: "auto",
      decorationOffsetHover: "3px"
    }
  },
  // `.c-button--disabled,.c-button--loading{opacity:.6}` and
  // `.c-base-input--disabled …{opacity:.6}` — 30 occurrences of `opacity:.6`.
  // The DS also declares `--ds-opacity-disabled: .4`, but NO rule consumes it
  // (0 `var()` references), so the operative value is 0.6.
  disabledOpacity: "0.6",
  // `.c-button{transition:background-color .3s,color .3s}`; the DS's only named
  // easing variable is `.c-accordion{--accordion-animation-easing}`.
  transition: {
    property: "background-color, border-color, color, box-shadow, outline-color",
    duration: "300ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // `.c-button{cursor:pointer}`; `.c-base-input--disabled …{cursor:default}`
  // and `.c-button--disabled{cursor:initial}` — Carrefour does NOT use
  // `not-allowed` on its disabled controls; `.c-base-input__label{cursor:text}`.
  cursor: { interactive: "pointer", disabled: "default", text: "text" },
  // Measured from `--ds-sizing-*`: xs 1rem, m 1.5rem, l 2rem.
  // `.c-button__icon-container{width:var(--ds-sizing-m);height:var(--ds-sizing-m)}`;
  // `.c-link--size-m .c-link__icon__container{width:var(--ds-sizing-xs)}`.
  iconSize: {
    sm: "1rem", // --ds-sizing-xs
    md: "1.5rem", // --ds-sizing-m
    lg: "2rem" // --ds-sizing-l
  },
  // FOCUS = a 2px OUTLINE in the action blue with a 2px offset, measured on the
  // least-scoped brand rule and repeated site-wide:
  // `.c-button:focus-visible{outline:2px solid var(--ds-color-interactive-border-focus);outline-offset:var(--ds-spacing-xxxs)}`.
  // `--ds-color-interactive-border-focus` = #0970e6, with 19 `var()` references across 17 rules
  // across the DS (buttons, inputs, accordion triggers, pagination, dropzones),
  // so this is the site-wide focus technique, not a one-component rule.
  focus: {
    strategy: "outline",
    width: "0.125rem", // 2px — --ds-border-size-2
    offset: "0.125rem", // --ds-spacing-xxxs
    color: carrefourColor.action.primary, // #0970e6 --ds-color-interactive-border-focus
    inset: "0"
  },
  // FIELD = BOXED (outline). Measured on the least-scoped field primitive,
  // `.c-base-input__container{border-radius:var(--ds-border-radius-4);
  // border:1px solid var(--ds-color-interactive-border-input-active);
  // background-color:var(--ds-color-interactive-background-input-active)}`
  // — a WHITE fill (#ffffff) with FOUR EQUAL 1px borders (#d9d9d9), which is
  // the `outline` case. Carrefour builds its select as a custom listbox
  // (`.c-input-select__option`), not a native `<select>`, so it publishes no
  // native chevron: the chevron artwork below is derived, drawn in the measured
  // action blue (à confirmer).
  field: {
    style: "outline",
    fillBg: carrefourColor.neutral[0], // #ffffff --ds-color-interactive-background-input-active
    underlineColor: carrefourColor.neutral[300], // #d9d9d9 — unused for `outline`, kept for completeness
    underlineWidth: "0.0625rem", // --ds-border-size-1
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230970e6' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 1rem center", // derived chevron artwork (à confirmer)
    selectPaddingRight: "2.5rem" // derived gutter for the redrawn chevron (à confirmer)
  },
  // --- The 12 component overrides ------------------------------------------
  // Cards: `.c-card{padding:var(--ds-spacing-m);border-radius:var(--ds-border-radius-4);
  // border:1px solid var(--ds-color-persistent-border-card-default);
  // background-color:var(--ds-color-persistent-background-card-default)}`
  // with `--ds-color-persistent-border-card-default` = #ebebeb and
  // `--ds-color-persistent-background-card-default` = #ffffff.
  card: {
    borderWidth: "0.0625rem", // --ds-border-size-1 (1px)
    lineHeight: "1.625", // html{font:100%/1.625 Open Sans}
    hoverBackground: carrefourColor.neutral[50] // #f7f7f7 --ds-color-core-background-main-secondary
  },
  // Secondary button = OUTLINED. The fill is declared by
  // `.c-button--variation-outlined,.c-button--variation-secondary{background-color:var(--ds-color-interactive-text-button-filled-main-active)}`
  // (#ffffff — Carrefour's own token name, odd for a background, but that is
  // the declaration); the stroke by
  // `.c-button--tone-main.c-button--variation-outlined:not(.c-button--reversed){border:1px solid var(--ds-color-interactive-background-button-filled-main-active)}`
  // (#0970e6). The hover rule for that button
  // (`…:not(.c-button--reversed):hover`) recolours ONLY `color` and `border`
  // (to …-main-hover) and declares NO `background-color`, so the resting white
  // fill persists on hover — transcribed as such, not invented.
  buttonSecondary: {
    background: carrefourColor.neutral[0], // #ffffff --ds-color-interactive-text-button-filled-main-active
    border: carrefourColor.action.primary, // #0970e6 --ds-color-interactive-background-button-filled-main-active
    hoverBackground: carrefourColor.neutral[0] // #ffffff — the hover rule declares no background-color
  },
  // Tabs: `.c-tabs__tab{padding:var(--ds-spacing-m) var(--ds-spacing-m);
  // border:2px solid var(--ds-color-core-background-main-secondary);
  // background-color:var(--ds-color-core-background-main-secondary)}` and
  // `.c-tabs__tab--selected{background-color:var(--ds-color-persistent-background-alternate);
  // border-color:var(--ds-color-interactive-border-tab-selected-active);
  // color:var(--ds-color-interactive-text-tab-selected-active)}`.
  tabs: {
    activeText: carrefourColor.action.tabSelected, // #0864e6 --ds-color-interactive-text-tab-selected-active
    activeBackground: carrefourColor.neutral[50], // #f7f7f7 --ds-color-persistent-background-alternate
    inactiveBackground: carrefourColor.neutral[50], // #f7f7f7 --ds-color-core-background-main-secondary
    activeWeight: "700", // .c-tag / .c-button weight — Carrefour's interactive weight
    paddingBlock: "1rem", // --ds-spacing-m
    paddingInline: "1rem", // --ds-spacing-m
    fontSize: "1rem", // .c-button{font-size:1rem}
    lineHeight: "1.5rem", // .c-button{line-height:1.5rem}
    indicatorSide: "bottom", // derived — .c-tabs__tab draws a full 2px box, not a single side (à confirmer)
    indicatorMode: "border"
  },
  // Pagination: `.c-pagination__list-item{border-radius:4px;
  // padding:var(--ds-spacing-xs) var(--ds-spacing-xs)}`,
  // `.c-pagination__list-item--active{color:#fff;
  // background-color:var(--ds-color-interactive-active-main-primary)}`,
  // `.c-pagination__page-number{width:var(--ds-sizing-m);height:var(--ds-sizing-m)}`,
  // `.c-pagination__list{gap:var(--ds-spacing-xxxs)}`.
  pagination: {
    background: "transparent", // .c-pagination__list-item declares no background
    border: "transparent",
    borderWidth: "0",
    text: carrefourColor.action.primary, // #0970e6 — .c-pagination__compact-nav .c-link inherits the link colour
    activeBackground: carrefourColor.action.primary, // #0970e6 --ds-color-interactive-active-main-primary
    activeText: carrefourColor.neutral[0], // #ffffff — .c-pagination__list-item--active{color:#fff}
    activeBorderWidth: "0",
    paddingBlock: "0.5rem", // --ds-spacing-xs
    paddingInline: "0.5rem", // --ds-spacing-xs
    minSize: "1.5rem", // --ds-sizing-m — .c-pagination__page-number width/height
    fontSize: "1rem", // .c-link--size-m
    lineHeight: "1.5rem" // .c-link--size-m{line-height:24px}
  },
  // Breadcrumb: `.c-breadcrumbs{--c-breadcrumb-color: var(--ds-color-interactive-text-link-accent-active);
  // gap:var(--ds-spacing-xs)}` and `.c-breadcrumbs__breadcrumb{color:var(--c-breadcrumb-color)}`
  // with `--ds-color-interactive-text-link-accent-active` = #121212: Carrefour's
  // breadcrumb trail is NEAR-BLACK, not blue.
  breadcrumb: {
    linkText: carrefourColor.neutral[900], // #121212 --ds-color-interactive-text-link-accent-active
    text: carrefourColor.neutral[900], // #121212 same token — the whole trail is one colour
    currentText: carrefourColor.neutral[900], // #121212
    separator: carrefourColor.neutral[900], // #121212 .c-breadcrumbs__separator{color:var(--c-breadcrumb-color)}
    fontSize: "0.875rem", // .c-link--size-s
    lineHeight: "1.25rem", // .c-link--size-s{line-height:20px}
    currentWeight: "700" // derived — Carrefour marks no weight on the current crumb (à confirmer)
  },
  // Alert / message box: Carrefour publishes no `.c-alert`; its notice surface
  // is the tag/badge "light" family, a filled tinted box with a 1px border of
  // the functional hue and a radius-4 corner. Paddings follow `.c-card`
  // (`padding:var(--ds-spacing-m)`); the left filet is derived (à confirmer).
  alert: {
    background: carrefourColor.system.infoLight, // #f5faff --ds-color-persistent-background-tag-light-information
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // derived — no filet is published (à confirmer)
    paddingTop: "1rem", // --ds-spacing-m (.c-card padding)
    paddingRight: "1rem", // --ds-spacing-m
    paddingBottom: "1rem", // --ds-spacing-m
    paddingLeft: "1.25rem", // derived — clears the derived filet (à confirmer)
    fontSize: "1rem", // .c-base-input__input / .c-button base size
    lineHeight: "1.625" // html{font:100%/1.625 Open Sans}
  },
  // Accordion: `.c-accordion{color:var(--ds-color-persistent-text-accordion-default);
  // background-color:var(--ds-color-persistent-background-accordion-default);
  // border-top:1px solid var(--ds-color-persistent-border-accordion-default)}`
  // (#121212 / #ffffff / #ebebeb) and
  // `.c-accordion__title-container{padding:var(--ds-spacing-m)}`.
  accordion: {
    text: carrefourColor.neutral[900], // #121212 --ds-color-persistent-text-accordion-default
    paddingBlock: "1rem", // --ds-spacing-m
    paddingInline: "1rem", // --ds-spacing-m
    fontSize: "1rem", // .c-accordion__title-container{font:inherit} → body 1rem
    fontWeight: "700", // derived — the trigger inherits its weight (à confirmer)
    lineHeight: "1.625" // html{font:100%/1.625 Open Sans}
  },
  // Tag: `.c-tag{font-weight:700;line-height:20px;border-radius:var(--ds-border-radius-4);
  // background:var(--ds-color-persistent-background-main)}` (#ffffff) and
  // `.c-tag--size-m{min-width:1.9rem;font-size:.875rem;
  // padding:var(--ds-spacing-xxs) var(--ds-spacing-xs)}`.
  tag: {
    radius: "0.25rem", // --ds-border-radius-4
    paddingBlock: "0.25rem", // --ds-spacing-xxs
    paddingInline: "0.5rem", // --ds-spacing-xs
    fontSize: "0.875rem", // .c-tag--size-m
    fontWeight: "700", // .c-tag
    lineHeight: "1.25rem", // .c-tag{line-height:20px}
    minHeight: "1.5rem", // derived — .c-tag--size-m publishes min-width 1.9rem, no min-height (à confirmer)
    neutralBackground: carrefourColor.neutral[50], // #f7f7f7 --ds-color-persistent-background-alternate (.c-badge--status-neutral)
    neutralText: carrefourColor.neutral[900] // #121212 --ds-color-persistent-text-primary
  },
  // Badge: `.c-badge{border-radius:10px;font-weight:700}` and
  // `.c-badge--size-m{padding:0 6px;font-size:.875rem;line-height:1.25rem}`,
  // `.c-badge--status-info{color:var(--ds-color-persistent-text-reversed-primary);
  // background-color:var(--ds-color-persistent-background-badge-information)}`
  // (#ffffff on #173eb4).
  badge: {
    radius: "0.625rem", // .c-badge{border-radius:10px}
    paddingBlock: "0", // .c-badge--size-m{padding:0 6px}
    paddingInline: "0.375rem", // 6px
    fontSize: "0.875rem", // .c-badge--size-m
    fontWeight: "700", // .c-badge
    lineHeight: "1.25rem", // .c-badge--size-m
    textTransform: "none",
    minHeight: "1.25rem", // derived — no min-height published; matches the measured line-height (à confirmer)
    infoBackground: carrefourColor.system.info, // #173eb4 --ds-color-persistent-background-badge-information
    infoText: carrefourColor.neutral[0] // #ffffff --ds-color-persistent-text-reversed-primary
  },
  // Checkbox / radio label: `.c-checkbox__label{font-size:1rem;font-weight:400;
  // color:var(--ds-color-interactive-text-input-label-default)}` and
  // `.c-radio__label{font-size:1rem;font-weight:400;color:var(--ds-color-interactive-text-input-label-default)}`
  // with `--ds-color-interactive-text-input-label-default` = #454545.
  choice: {
    labelFontSize: "1rem", // .c-checkbox__label / .c-radio__label
    labelLineHeight: "1.5rem", // derived — the labels publish no line-height (à confirmer)
    radioLineHeight: "1.5rem", // derived (à confirmer)
    labelColor: carrefourColor.neutral[700] // #454545 --ds-color-interactive-text-input-label-default
  },
  // Search: Carrefour publishes no dedicated search control; its search field
  // is the same `.c-base-input` primitive, so the geometry is that of
  // `.c-base-input--size-m .c-base-input__container{padding-left:var(--ds-spacing-m);
  // padding-right:var(--ds-spacing-m)}` +
  // `.c-base-input--size-m .c-base-input__input{padding-top/bottom:var(--ds-spacing-m)}`.
  search: {
    paddingBlock: "1rem", // --ds-spacing-m
    paddingInline: "1rem", // --ds-spacing-m
    fontSize: "1rem", // .c-base-input__input
    lineHeight: "1.375" // .c-base-input__input{line-height:1.375}
  },
  // Toggle: `.c-toggle__track{width:56px;height:32px;
  // border-radius:var(--ds-border-radius-24);padding:var(--ds-spacing-xxs);
  // background-color:var(--ds-color-interactive-background-input-toggle-active)}`
  // (#d9d9d9 unchecked, #0970e6 checked) with
  // `.c-toggle__handle{background-color:var(--ds-color-interactive-background-input-toggle-handle)}`
  // (#ffffff) and `.c-toggle__label{font-size:1rem;
  // color:var(--ds-color-interactive-text-input-label-default)}`.
  toggle: {
    trackPadding: "0.25rem", // --ds-spacing-xxs
    lineHeight: "1.5rem", // derived — .c-toggle__label publishes no line-height (à confirmer)
    textColor: carrefourColor.neutral[700] // #454545 --ds-color-interactive-text-input-label-default
  }
} as const;

// --- semantic (Carrefour-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: carrefourColor.neutral[0], // #ffffff --ds-color-core-background-main-primary / body,html{background-color:#fff}
    subtle: carrefourColor.neutral[50], // #f7f7f7 --ds-color-core-background-main-secondary
    raised: carrefourColor.neutral[0], // #ffffff --ds-color-persistent-background-card-default / -modal-default
    inverse: carrefourColor.neutral[900], // #121212 --ds-color-core-background-reversed-primary
    // MEASURED, not derived: three concordant brand rules draw the backdrop as
    // `.c-modal:before{opacity:.5;background-color:var(--ds-color-persistent-background-overlay-default)}`
    // (same in `.c-drawer:before` and `.c-popin:before`), with
    // `--ds-color-persistent-background-overlay-default` = #121212.
    overlay: "rgb(18 18 18 / 0.5)"
  },
  text: {
    primary: carrefourColor.neutral[900], // #121212 --ds-color-core-content-main-primary (18.73:1 on white)
    secondary: carrefourColor.neutral[700], // #454545 --ds-color-core-content-main-secondary (9.59:1)
    muted: carrefourColor.neutral[600], // #575757 --ds-color-core-content-main-tertiary (7.23:1)
    inverse: carrefourColor.neutral[0], // #ffffff --ds-color-core-content-reversed-primary
    link: carrefourColor.action.primary // #0970e6 --ds-color-interactive-text-link-main-active (4.70:1 — passes 4.5:1)
  },
  border: {
    subtle: carrefourColor.neutral[300], // #d9d9d9 --ds-color-interactive-border-input-active (the field stroke)
    strong: carrefourColor.neutral[500], // #878787 --ds-color-interactive-border-input-pressed (3.59:1 — passes the 3:1 line floor)
    interactive: carrefourColor.action.primary // #0970e6 --ds-color-interactive-border-main-active (4.70:1)
  },
  action: {
    primary: carrefourColor.action.primary, // #0970e6 --ds-color-interactive-background-button-filled-main-active
    primaryHover: carrefourColor.action.hover, // #004e9b --ds-color-interactive-background-button-filled-main-hover
    primaryText: carrefourColor.neutral[0], // #ffffff --ds-color-interactive-text-button-filled-main-active (4.70:1 on #0970e6)
    secondary: carrefourColor.neutral[50], // #f7f7f7 --ds-color-core-background-main-secondary
    secondaryHover: carrefourColor.neutral[300], // #d9d9d9 --ds-color-interactive-background-input-addon-hover
    secondaryText: carrefourColor.neutral[900], // #121212 --ds-color-interactive-content-subtle-active
    danger: carrefourColor.system.error // #df1116 --ds-color-interactive-background-button-filled-destructive-active (4.97:1)
  },
  feedback: {
    success: carrefourColor.system.success, // #2c815e (4.76:1)
    warning: carrefourColor.system.warning, // #8a5f00 (5.65:1)
    error: carrefourColor.system.error, // #df1116 (4.97:1)
    info: carrefourColor.system.info // #173eb4 (8.81:1)
  },
  status: {
    pending: carrefourColor.system.warning, // #8a5f00 --ds-color-persistent-background-functional-main-warning
    processing: carrefourColor.system.info, // #173eb4 --ds-color-persistent-background-functional-main-information
    completed: carrefourColor.system.success, // #2c815e --ds-color-persistent-background-functional-main-success
    failed: carrefourColor.system.error // #df1116 --ds-color-persistent-background-functional-main-negative
  },
  // Categorical data-vis palette taken WHOLESALE from Carrefour's own
  // `--ds-color-decorative-background-reversed-*` scale — the DS's saturated
  // decorative family, which is exactly a categorical set. No derivation.
  data: {
    category1: carrefourColor.action.primary, // #0970e6 action blue
    category2: carrefourColor.decorative.ginger, // #b33308 --ds-color-decorative-background-reversed-ginger
    category3: carrefourColor.decorative.sacramento, // #006064 --ds-color-decorative-background-reversed-sacramento
    category4: carrefourColor.decorative.olive, // #827717 --ds-color-decorative-background-reversed-olive
    category5: carrefourColor.decorative.raisin, // #4a148c --ds-color-decorative-background-reversed-raisin
    category6: carrefourColor.decorative.forest, // #004f2b --ds-color-decorative-background-reversed-forest
    category7: carrefourColor.decorative.walnut, // #5c2e1d --ds-color-decorative-background-reversed-walnut
    category8: carrefourColor.decorative.graphite // #263238 --ds-color-decorative-background-reversed-graphite
  }
} as const;

/**
 * The Carrefour theme as a Sentropic `TenantTheme`. `foundation` and `semantic`
 * carry Carrefour's measured `--ds-*` values, and the `component` layer is
 * REBUILT from them via `createComponent`, so the action blue reaches every
 * component (buttons, tabs, pagination, chat bubbles…) and not only the
 * elements that read semantic vars directly.
 */
export const carrefourTheme: TenantTheme = {
  id: "carrefour",
  label: "Carrefour",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default carrefourTheme;
