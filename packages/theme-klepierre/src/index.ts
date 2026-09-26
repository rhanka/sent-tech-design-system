import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Klépierre brand theme for the Sentropic token structure.
 *
 * Measured-clone from the public Klépierre corporate site
 * (`https://www.klepierre.com/`): the `:root` `--color-*` token block and the
 * brand rules of `app.b220931f.css`, plus the `Calibre` face declared by
 * `--font-calibre` / `font-faces.css`. Only public colour values and font
 * *names* are referenced — no font binaries. Sources, counts and every
 * derived value are documented in MAPPING.md; derived values are flagged
 * `à confirmer` here and there.
 *
 * Counting convention (see MAPPING.md): `var()` refs = matches of
 * `var(--token[,)]` in the brand region; literal occurrences = case-normalised
 * hex-string matches in the brand region (all brand hex is lowercase; short
 * forms are expanded to 6 digits on transcription, e.g. `#111` → `#111111`).
 * The brand region is `app.b220931f.css` minus the bare-Plyr vendor run and
 * the tarteaucitron consent-manager tail; `chunk-vendors.*.css` (a
 * sanitize-style reset) is vendor throughout. Counts below are
 * `var() refs / literal occurrences`.
 *
 * Klépierre colour reference (light theme):
 *   Main blue (action / titles / inverse)   #141b4d   (--color-main-blue)
 *   Main-blue hover lift                    #192261   (`.btn-main-blue-bg:hover`)
 *   Ink (running text)                      #111111   (--color-dark / body)
 *   Gold accent                             #bd9360   (--color-gold)
 *   Silver (dark-context secondary text)    #a99d90   (--color-silver)
 *   Pink accent                             #ef7e81   (--color-pink)
 *   Panel mist (lightest cool surface)      #ededf0   (footer centre-list bg)
 *   Image mist (placeholder bands)          #eeeeee   (literal, 9×)
 *   Hairline grey (light-form underline)    #dddddd   (--color-gray)
 *   Stories rose (switch accent)            #d17389   (literal, 5×)
 *   Act-for-good greens                     #134660 #1b9476 #8cd59f #cad0b9
 */

// --- Klépierre raw colour palette (public site tokens) ----------------------
const klepierreColor = {
  // Main-blue family — the brand ink.
  brand: {
    mainBlue: "#141b4d", // --color-main-blue (165 var / 171 lit)
    mainBlueHover: "#192261", // `.btn-main-blue-bg:focus/hover` background (0 var / 1 lit)
    panelMist: "#ededf0" // `.footer-main-menu .centre-list` background (0 var / 1 lit)
  },
  // Gold / metallic accent family.
  accent: {
    gold: "#bd9360", // --color-gold (65 var / 68 lit)
    goldHover: "#c49f72", // `.btn-gold-bg:focus/hover` background (0 var / 1 lit)
    navGold: "#ead8b6", // --color-nav-gold (3 var / 4 lit)
    silver: "#a99d90", // --color-silver (18 var, 15× as `color:` / 21 lit)
    silverHover: "#b4aa9e" // `.btn-silver-bg:focus/hover` background (0 var / 1 lit)
  },
  // Pink / rose family.
  pink: {
    main: "#ef7e81", // --color-pink (35 var / 40 lit)
    light: "#f7b386", // --color-light-pink (3 var / 4 lit)
    storiesRose: "#d17389" // stories grid-switch accent, literal only (0 var / 5 lit)
  },
  // Green family (Act for Good + main green).
  green: {
    main: "#1eada5", // --color-main-green (2 var / 3 lit)
    afg1: "#134660", // --color-act-for-good-1 (1 var / 2 lit)
    afg2: "#1b9476", // --color-act-for-good-2 (1 var / 2 lit)
    afg3: "#8cd59f", // --color-act-for-good-3 (1 var / 2 lit)
    afg4: "#cad0b9" // --color-act-for-good-4 (1 var / 2 lit)
  },
  // Yellow family.
  yellow: {
    main: "#ffdb76", // --color-yellow (3 var / 4 lit)
    nav: "#fac84f" // --color-nav-yellow (1 var / 2 lit; painted, no role — `yellow.main` wins the warning role on frequency)
  },
  // Social blue — declared and painted once (social icon), no Sentropic role.
  social: {
    twitter: "#508bdb" // --color-twitter (1 var / 2 lit; painted, no role)
  },
  // Neutral grey scale.
  grey: {
    0: "#ffffff", // --color-white (120 var / 235 lit)
    imageMist: "#eeeeee", // literal placeholder/header-band background (0 var / 9 lit)
    hairline: "#dddddd", // --color-gray (4 var / 5 lit)
    ink: "#111111", // --color-dark (38 var / 50 lit; `body{color}`)
    black: "#000000", // --color-black (21 var / 37 lit)
    blackHover: "#0d0d0d" // `.btn-black-bg:focus/hover` background (0 var / 1 lit)
  },
  // Declared tokens with zero consumption (own declaration only): kept for
  // provenance, carrying no role.
  unpainted: {
    normal: "#909090", // --color-normal (0 var / 1 lit — declaration only, no role)
    grayHover: "#747474", // --color-gray-hover (0 var / 1 lit — declaration only, no role)
    blue: "#497bb8", // --color-blue (0 var / 1 lit — declaration only, no role)
    lightBlue: "#89cfdd", // --color-light-blue (0 var / 1 lit — declaration only, no role)
    green: "#1eeda5", // --color-green (0 var / 1 lit — declaration only, no role)
    facebook: "#4267b2", // --color-facebook (0 var / 1 lit — declaration only, no role)
    youtube: "rgba(255,255,0,0)", // --color-youtube (0 var — fully transparent, no role)
    navigation: "#141b4d", // --color-navigation aliases --color-main-blue (0 direct var)
    navigationBorder: "hsla(0,0%,100%,0.2)" // --color-navigation-border aliases --color-white-20 (0 direct var)
  },
  // Stop-rule products (derived — à confirmer; chains in MAPPING.md).
  derived: {
    muted: "#9e9082", // from silver #a99d90 (2.65) — 1 step, 3.10:1 (à confirmer)
    success: "#177e65", // from afg2 #1b9476 (3.79) — 1 step, 4.99:1 (à confirmer)
    error: "#c44d69" // from stories rose #d17389 (3.22) — 2 steps, 4.55:1 (à confirmer)
  }
} as const;

// --- foundation (Klépierre-specific values) ---------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family: the main blue + its hover lift + the
    // lightest painted cool surface (nothing darker than the primary is painted).
    blue: {
      10: klepierreColor.brand.panelMist, // #ededf0 footer panel
      60: klepierreColor.brand.mainBlueHover, // #192261 button hover lift
      80: klepierreColor.brand.mainBlue // #141b4d deepest painted blue
    },
    // Sentropic "cyan" accent slot mapped onto the metallic family (gold wins
    // over pink on frequency: 65 vs 35 var refs).
    cyan: {
      10: klepierreColor.accent.navGold, // #ead8b6 light gold
      50: klepierreColor.accent.gold, // #bd9360 gold accent
      70: klepierreColor.accent.silver // #a99d90 metallic dark step
    },
    // Sentropic "slate" role family mapped onto the painted greys.
    slate: {
      0: klepierreColor.grey[0], // white
      10: klepierreColor.grey.imageMist, // #eeeeee placeholders
      20: klepierreColor.grey.hairline, // #dddddd hairlines
      60: klepierreColor.accent.silver, // #a99d90
      80: klepierreColor.grey.ink, // #111111 running ink
      90: klepierreColor.grey.black // #000000 darkest
    },
    feedback: {
      success: klepierreColor.derived.success, // stop-rule product (à confirmer)
      warning: klepierreColor.yellow.main, // #ffdb76 with dark text (14.07:1)
      error: klepierreColor.derived.error, // stop-rule product (à confirmer)
      info: klepierreColor.green.afg1 // #134660, white on it 10.13:1
    }
  },
  // Klépierre ships the Calibre webfont under the hashed family name
  // "b8ffa454" (`font-faces.css`, `--font-calibre`); the Avenir stack labels
  // media overlays. We reference the font *names* only, never binaries.
  font: {
    sans: "'b8ffa454', Calibre, Arial, Helvetica, sans-serif",
    display: "'Avenir', 'Avenir Next', 'Helvetica Neue', 'Segoe UI', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Base 4px-multiple scale, rewritten: the brand spaces in 4px multiples
  // (`--gutter:16px`, `--padding:8px`, button 12px, gutters 16/32px).
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
  // Klépierre is sharp-cornered (controls `border-radius:0`) with round
  // pills and circular media (50%). Brand root is 10px; px values are exact.
  radius: {
    none: "0", // `select{border-radius:0}` + sharp buttons (no radius drawn)
    sm: "5px", // `.jobofferfeedblock .offer` card
    md: "12px", // `.persons-graph-item-infos-content` modal card
    lg: "30px", // `.blogpost-listing--more-button`, stories switch buttons
    pill: "999px" // 36× `border-radius:50%` circular media
  },
  // The three measured elevation shadows (black-tinted).
  shadow: {
    subtle: "0 0 14px rgba(0,0,0,.13)", // `.blogpost-mall-reference` + overlay type badge
    medium: "0 12px 24px rgba(0,0,0,.07)", // `.search-panel .mall-item__metas`
    floating: "0 3px 70px 0 rgba(0,0,0,.15)" // `.dropdown-list-wrapper`
  },
  // Transition time-tokens in the brand region (228 declarations; convention:
  // `[0-9.]+m?s` inside `transition:`/`transition-duration:`, all seconds,
  // leading-dot decimals): `.5s` 38, `.2s` 36, `.25s` 33, `.4s` 28, `.3s` 19,
  // `.6s` 16, `1s` 13, `.7s` 12, `.15s` 11, `1.4s` 10, rest ≤4.
  motion: {
    fast: "200ms", // `.2s` ×36
    normal: "500ms", // `.5s` ×38 (most frequent)
    slow: "1000ms", // `1s` ×13 (most frequent long token)
    easing: "cubic-bezier(0.4,0.5,0.15,1)" // --ease-default (57 var refs)
  },
  // The brand publishes page-composition z layers (navigation 200, overlay
  // 201, modal 9999, flash notice 10000 — quoted in MAPPING.md), not a 5-role
  // scale: transcribing them raw would break stack order (no toast/chat
  // layer). Base scale kept, all à confirmer.
  z: {
    header: 50, // (à confirmer)
    toast: 60, // (à confirmer)
    overlay: 80, // (à confirmer)
    modal: 100, // (à confirmer)
    chat: 110 // (à confirmer)
  },
  // --- Anatomy primitives (Klépierre) ---------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // ubiquitous hairline (inputs, offer card, title rules)
    thick: "2px" // pagination indicator bar + brandfeedblock search underline
  },
  borderStyle: { solid: "solid" }, // zero dashed/dotted in the brand region
  // Control density. The `.btn` scale is a marketing-CTA scale, so only the
  // small-button height and the input/textarea geometry transcribe; the rest
  // is reference-package geometry (à confirmer). Brand root 10px → rem at 16.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0.75rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.75rem", paddingInline: "0", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1.25rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0.75rem", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // Klépierre typography at the 10px root: CTA buttons 12px/12px uppercase,
  // fields 20px/28px, labels 14px/18px, links unadorned (none 59× vs
  // underline 3×, all hover/contextual).
  typography: {
    control: { family: "'b8ffa454', Calibre, Arial, Helvetica, sans-serif", size: "0.75rem", weight: "600", lineHeight: "1", letterSpacing: "0.09375rem", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'b8ffa454', Calibre, Arial, Helvetica, sans-serif", size: "1.25rem", weight: "400", lineHeight: "1.4", letterSpacing: "0.0125rem", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'b8ffa454', Calibre, Arial, Helvetica, sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.2857", letterSpacing: "0.03125rem", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Links carry no underline at rest; news/carousel titles underline on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "0.18em",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "0.18em"
    }
  },
  disabledOpacity: "0.2", // disabled nav + loading form (2× `.2`)
  // The `.btn` fill transition: background-color, `.7s`, --ease-classic.
  transition: { property: "background-color", duration: "700ms", easing: "cubic-bezier(0.23,1,0.32,1)" },
  cursor: { interactive: "pointer", disabled: "default", text: "text" },
  // No icon scale is published (single `.icon-load` 20px + 32px button glyphs
  // quoted in MAPPING.md): base values, all à confirmer.
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // Klépierre draws NO focus outline or ring: `*{outline:none}`, no
  // `:focus-visible`, focus = border-colour/opacity/underline shifts. The
  // outline technique below is encoded for parity (à confirmer).
  focus: {
    strategy: "outline", // (à confirmer — no brand technique published)
    width: "2px", // (à confirmer)
    offset: "2px", // (à confirmer)
    color: klepierreColor.brand.mainBlue, // #141b4d, 16.23:1 on white (à confirmer)
    inset: "0"
  },
  // Light-context form controls (`.contactblock-general-contact`): transparent
  // fill, single 1px `#ddd` bottom border → filled-underline in `border` mode.
  // (The dark-context form uses a `white-20` underline + white chevron.)
  field: {
    style: "filled-underline",
    fillBg: klepierreColor.grey[0], // transparent over the white page
    underlineColor: klepierreColor.grey.hairline, // #dddddd light-form underline
    underlineWidth: "1px",
    underlineMode: "border", // `border-bottom` declaration (not an inset shadow)
    // Native <select>: redrawn main-blue triangle (light-context variant of
    // the brand's 32px `M10 12h13l-6.5 7z` chevron) + `appearance:none`. The
    // brand draws no right gutter (no `padding-right` on `select`): the
    // 2.5rem gutter is reference-package geometry (à confirmer).
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath fill='%23141b4d' d='M10 12h13l-6.5 7z'/%3E%3C/svg%3E\") no-repeat right 0/32px auto",
    selectPaddingRight: "2.5rem" // (à confirmer)
  },
  // Card = the bordered job-offer card (1px `dark-20`, 5px radius). No card
  // hover fill is published (offer/news hovers shift icons/images, not fills).
  card: {
    borderWidth: "1px",
    lineHeight: "1.4", // news-item content line-height
    hoverBackground: klepierreColor.grey.imageMist // #eeeeee own subtle (à confirmer)
  },
  // Secondary button = the base `.btn`: transparent fill, NO border drawn,
  // main-blue uppercase label. No light-context hover fill is published.
  buttonSecondary: {
    background: "transparent",
    border: "transparent", // no border declaration on `.btn` (reset `border:none` stands)
    hoverBackground: klepierreColor.brand.panelMist // #ededf0 lightest cool surface (à confirmer)
  },
  // No tab component is published (empty greps in MAPPING.md): bottom-border
  // indicator transcribed from the pagination bar (à confirmer).
  tabs: {
    activeText: klepierreColor.brand.mainBlue, // #141b4d (à confirmer)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600", // brand emphasis weight (à confirmer)
    paddingBlock: "0.75rem", // 12px (à confirmer)
    paddingInline: "1rem", // 16px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    indicatorSide: "bottom", // pagination-bar precedent (à confirmer)
    indicatorMode: "border" // (à confirmer)
  },
  // Pagination = borderless 18px/24px text links; active/hover/focus grows a
  // 2px currentColor bar (opacity 0→1). Text inherits the body ink.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: klepierreColor.grey.ink, // #111111 body context (à confirmer)
    activeBackground: "transparent", // bar indicator, no fill
    activeText: klepierreColor.grey.ink, // no colour change published (à confirmer)
    activeBorderWidth: "0",
    paddingBlock: "0", // `padding:0 4px`
    paddingInline: "0.25rem", // 4px
    minSize: "2.25rem", // 36px (à confirmer)
    fontSize: "1.125rem", // 18px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb = uppercase 12px/600 currentColor crumbs at .6 opacity (1 on
  // hover/focus), 11px dash separators. No link/current distinction is drawn.
  breadcrumb: {
    linkText: klepierreColor.brand.mainBlue, // (à confirmer — currentColor routed)
    text: klepierreColor.brand.mainBlue, // (à confirmer — no distinction drawn)
    currentText: klepierreColor.brand.mainBlue, // (à confirmer — no distinction drawn)
    separator: klepierreColor.brand.mainBlue, // (à confirmer — currentColor dash)
    fontSize: "0.75rem", // 12px
    lineHeight: "1.5rem", // 24px (à confirmer)
    currentWeight: "600" // all crumbs share one weight
  },
  // Alert = the unboxed form `.alert`: silver 14px/18px/600 text, no box, no
  // borders. (The gold-bordered flash message is a modal pattern, not an
  // inline notice — see MAPPING.md.)
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0",
    paddingTop: "0", // unboxed text (à confirmer)
    paddingRight: "0", // unboxed text (à confirmer)
    paddingBottom: "0", // unboxed text (à confirmer)
    paddingLeft: "0", // unboxed text (à confirmer)
    fontSize: "0.875rem", // 14px
    lineHeight: "1.125rem" // 18px
  },
  // No accordion is published (empty greps in MAPPING.md).
  accordion: {
    text: klepierreColor.grey.ink, // #111111 = text.primary (à confirmer)
    paddingBlock: "0.75rem", // 12px (à confirmer)
    paddingInline: "1rem", // 16px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    fontWeight: "600", // brand emphasis weight (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Tag = the uppercase 12px/600 filter pill (24px radius, 8px/16px pads).
  // The brand pills are white-on-dark; the light-theme chip below is routed
  // to the own subtle surface (à confirmer).
  tag: {
    radius: "24px",
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.5rem", // 24px (à confirmer)
    minHeight: "1.5rem", // 24px (à confirmer)
    neutralBackground: klepierreColor.grey.imageMist, // #eeeeee (à confirmer)
    neutralText: klepierreColor.grey.ink // #111111 (à confirmer)
  },
  // No badge is published (empty greps in MAPPING.md): sharp by brand
  // aesthetic, uppercase from the filter pills.
  badge: {
    radius: "0", // sharp controls (à confirmer)
    paddingBlock: "0", // (à confirmer)
    paddingInline: "0.5rem", // 8px (à confirmer)
    fontSize: "0.875rem", // 14px (à confirmer)
    fontWeight: "600", // brand emphasis weight (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    textTransform: "uppercase", // filter-pill precedent
    minHeight: "1.5rem", // 24px (à confirmer)
    infoBackground: klepierreColor.brand.mainBlue, // #141b4d (à confirmer)
    infoText: klepierreColor.grey[0] // white, 16.23:1 (à confirmer)
  },
  // No checkbox/radio is published (empty greps in MAPPING.md).
  choice: {
    labelFontSize: "1rem", // 16px (à confirmer)
    labelLineHeight: "1.5rem", // 24px (à confirmer)
    radioLineHeight: "1.5rem", // 24px (à confirmer)
    labelColor: klepierreColor.grey.ink // #111111 = text.primary (à confirmer)
  },
  // Search = the inline brandfeedblock input (40px, 2px `main-blue-20`
  // underline, border → main-blue on focus): no inline/block padding beyond
  // a 45px right icon gutter (no primitive). Font inherits: unmeasured.
  search: {
    paddingBlock: "0",
    paddingInline: "0",
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // No on/off switch is published (the stories grid-switch is a two-view
  // switcher of 60px circle buttons, not a toggle — see MAPPING.md).
  toggle: {
    trackPadding: "0", // (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    textColor: klepierreColor.grey.ink // #111111 = text.primary (à confirmer)
  }
} as const;

// --- semantic (Klépierre-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: klepierreColor.grey[0], // white (`.main-wrapper` page ground)
    subtle: klepierreColor.grey.imageMist, // #eeeeee header-band/placeholder ground
    raised: klepierreColor.grey[0], // white cards/dropdowns/panels
    inverse: klepierreColor.brand.mainBlue, // #141b4d keyfigure/nav-inverse ground
    overlay: "rgba(0,0,0,0.87)" // `.documents-listing .modal` backdrop
  },
  text: {
    primary: klepierreColor.grey.ink, // #111111 body ink (18.88:1)
    secondary: klepierreColor.brand.mainBlue, // #141b4d title/button ink (16.23:1)
    muted: klepierreColor.derived.muted, // #9e9082 stop-rule product, 3.10:1 — documented arbitration (à confirmer)
    inverse: klepierreColor.grey[0], // white on the main blue (16.23:1)
    link: klepierreColor.brand.mainBlue // #141b4d footer/button-link ink (16.23:1)
  },
  border: {
    subtle: klepierreColor.grey.hairline, // #dddddd light-form underline + title rules
    strong: klepierreColor.accent.silver, // #a99d90 darkest painted neutral
    interactive: klepierreColor.brand.mainBlue // #141b4d search-input focus border (16.23:1)
  },
  action: {
    primary: klepierreColor.brand.mainBlue, // #141b4d `.btn-main-blue-bg`
    primaryHover: klepierreColor.brand.mainBlueHover, // #192261 measured hover lift
    primaryText: klepierreColor.grey[0], // white (14.56:1 on the hover)
    secondary: klepierreColor.accent.silver, // #a99d90 `.btn-silver-bg`
    secondaryHover: klepierreColor.accent.silverHover, // #b4aa9e measured hover lift
    secondaryText: klepierreColor.brand.mainBlue, // #141b4d on silver (6.12:1)
    danger: klepierreColor.derived.error // #c44d69 stop-rule product, white on it 4.55:1 (à confirmer)
  },
  feedback: {
    success: klepierreColor.derived.success, // #177e65 stop-rule product, 4.99:1 (à confirmer)
    warning: klepierreColor.yellow.main, // #ffdb76 with dark text (14.07:1)
    error: klepierreColor.derived.error, // #c44d69 (à confirmer)
    info: klepierreColor.green.afg1 // #134660 (10.13:1)
  },
  status: {
    pending: klepierreColor.yellow.main,
    processing: klepierreColor.green.afg1,
    completed: klepierreColor.derived.success,
    failed: klepierreColor.derived.error
  },
  // Categorical palette from the painted accents (all carry ≥1 var() ref):
  // main blue, gold, pink, main green, yellow, and three Act-for-good greens.
  data: {
    category1: klepierreColor.brand.mainBlue, // #141b4d
    category2: klepierreColor.accent.gold, // #bd9360
    category3: klepierreColor.pink.main, // #ef7e81
    category4: klepierreColor.green.main, // #1eada5
    category5: klepierreColor.yellow.main, // #ffdb76
    category6: klepierreColor.green.afg1, // #134660
    category7: klepierreColor.green.afg2, // #1b9476
    category8: klepierreColor.pink.light // #f7b386
  }
} as const;

/**
 * The Klépierre brand as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Klépierre-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so the brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const klepierreTheme: TenantTheme = {
  id: "klepierre",
  label: "Klépierre",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default klepierreTheme;
