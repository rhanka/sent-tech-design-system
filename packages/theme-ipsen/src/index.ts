import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Ipsen brand theme for the Sentropic token structure.
 *
 * Ipsen (ipsen.com, WordPress theme `ipsen-main`) publishes no tokenised
 * design system; this package is a MEASURED-CLONE mapping read from the
 * brand's public stylesheets linked from the homepage (three Jetpack
 * `/_static/` bundles + the `riovizual` plugin sheet, fetched 2026-09-25).
 * The signature is the deep navy `#000e56` (the brand's own `charcoal-grey`
 * utility): body text, primary CTA fill and footer ground at once. We
 * reference the brand font *name* (Rethink Sans, the `@font-face` family
 * served from `/wp-content/themes/ipsen-main/dist/fonts/`) only — never
 * font binaries. Sources and exact provenance are documented in MAPPING.md.
 * Where the brand publishes no equivalent for a Sentropic role (warning
 * amber, categorical scale, breadcrumb/tag/badge/toggle geometry), the
 * closest derived value is used and flagged `à confirmer` here and in
 * MAPPING.md.
 *
 * Ipsen colour reference (light theme):
 *   White (surfaces, inverse text)       #ffffff   (surface default / raised)
 *   Warm light neutral                   #edebe4   (subtle surface / secondary / field stroke)
 *   Card / divider hairline              #c4c9cb   (strong border)
 *   Muted grey                           #8f9699   (muted text, 3.00:1 — documented arbitration)
 *   Dark grey                            #5d6265   (secondary text / pagination)
 *   Editorial near-black                 #292c31   (darkest neutral — no role)
 *   Brand navy (body / action / footer)  #000e56   (primary text / action / link / inverse)
 *   Hover blue                           #061f80   (primary hover / link hover)
 *   Primary blue (links / interactive)   #224a81   (interactive border)
 *   Primary light blue                   #2797d3   (info / accent)
 *   Nav indicator blue                   #3286d6   (tab indicator — informational)
 *   Error red (form validation)          #c02b0a   (danger — GF-stock coincidence noted)
 *   Success green                        #00b050   (brand `true-green` utility — consumption gap noted)
 *   Warning amber                        #b25e09   (derived, 4.67:1 — à confirmer)
 */

// --- Ipsen raw colour palette ------------------------------------------------
// Counts below are literal occurrences in the brand region (2 317 rules:
// bundle all-css-0 whole + bundle all-css-14 lines 2536-3921 minus 34
// vendor-widget rules + bundle all-css-12 exit-popup block), exact 6-digit
// match, case normalised (`#000e56` and `#000E56` are one colour and two
// strings). The brand declares no `--*` custom properties, so every `var()`
// count is zero and consumption is literal-only. Per-file counts in MAPPING.md.
const ipsenColor = {
  // Brand navy family. `#000e56` ×184 (52+2+130) — body text, `.btn-primary`
  // fill, `.footer-mainbg` ground, select chevron pixels.
  navy: {
    primary: "#000e56", // body{color} / .btn-primary bg / footer bg / `.charcoal-grey`
    hover: "#061f80", // .btn-primary:hover + a:hover — site-wide hover blue (×26)
    heroHover: "#3766a8", // hero CTA hover only, hero-scoped (×7)
    gradient: "#003e7e", // hero carousel gradient stop (×2)
    cardButton: "#153f99" // .card-btn fill + exit-modal secondary hover (×3)
  },
  // Brand blue family. Utilities `.primary-blue`, `.primary-light-blue`,
  // `.light-blue` + nav/search/booking accents.
  blue: {
    primary: "#224a81", // `.primary-blue` — links, buttons, checkbox accent (×19)
    light: "#2797d3", // `.primary-light-blue` — buttons, link hovers (×39)
    nav: "#3286d6", // nav tab active filet + dropdown markers (×8)
    tint: "#e7faff", // `.light-blue` — filter gradient, accordion hover (×6)
    sectionBg: "#dbeaf5", // slim-card blue section ground (×6)
    bookingBg: "#e6f8fe", // book-meeting slot button fill (×1)
    footerRule: "#50aaf8", // footer hr + search arrow hover (×3)
    searchArrow: "#6ec4ff", // search arrow ring (×5)
    buttonHover: "#3fafeb", // slim-card / date button hover (×3)
    divider: "#6eb6c7", // footer divider (`.vibrant-blue` / `.smoke-grey`) (×7)
    serious: "#4a7992", // `.serious-blue` utility declaration only (×1)
    chevron: "#10435e", // `i.bi-chevron-*` icon colour (×1)
    checkBorder: "#006fee", // gravity contact checkbox 2px stroke (×1)
    imgFocus: "#dbdde8" // focus outline on image-ground CTA (×1)
  },
  // Green family. No validation green is painted; `.true-green` is declared
  // once and unconsumed on the homepage (documented gap).
  green: {
    trueGreen: "#00b050", // `.true-green` utility — success role (×1, see MAPPING.md)
    vibrant: "#b2c966", // `.vibrant-green` + slim green section ground (×3)
    stockUp: "#00ff1a" // stock-ticker gain only — scoped financial data, no system role (×5)
  },
  // Red family. `#c02b0a` ×16 in brand-authored Gravity Forms validation
  // overrides (one under the brand `.italy-contact-form` wrapper); may
  // coincide with Gravity Forms stock (comparison attempted, stock served
  // empty — see MAPPING.md).
  red: {
    error: "#c02b0a", // form validation error (×16)
    errorTint: "#fff9f9", // validation message ground (×3)
    legacyError: "#790000", // legacy-markup validation text (×2)
    vibrant: "#c84874", // `.vibrant-red` / `.light-grey` declarations only (×2)
    stockDown: "#ff1a1a" // stock-ticker loss only — scoped financial data (×2)
  },
  // Neutral scale. White ×131; `#edebe4` ×48 (+1 `var()` fallback).
  grey: {
    white: "#ffffff", // card / field / modal grounds, inverse text
    subtle: "#edebe4", // subtle surface, secondary, `.form-control` 2px stroke
    hairline: "#c4c9cb", // card + divider strokes (×9)
    muted: "#8f9699", // muted text + input/divider strokes (×6)
    dark: "#5d6265", // `.dark-grey` — secondary text, pagination (×5)
    charcoal: "#292c31", // editorial headings/paragraphs (×9, brand-0 only)
    hero: "#5a5a5a", // `.hero-section` text, hero-scoped (×1)
    booking: "#cdd1d3", // book-meeting borders + shadows (×4)
    mobileBorder: "#d7d7d7", // mobile-menu close stroke (×1)
    vendorGrey: "#dee2e6", // book-meeting footer rule — Bootstrap stock retained (×1)
    black: "#000000", // filter hover text, quote dash, `clr-black` (×7, `#000` expanded)
    shadowBlack: "#00000d", // accordion-bar shadow tint (×1)
    disabledBg: "#eeeeee", // disabled slot fill (`#eee` expanded) (×3)
    gravityBorder: "#cccccc", // gravity section stroke (`#ccc` expanded) (×2)
    slotFull: "#999999", // full-slot fill (`#999` expanded) (×2)
    slotBorder: "#dddddd", // slot button stroke (`#ddd` expanded) (×1)
    disabledText: "#aaaaaa" // disabled slot text (`#aaa` expanded) (×1)
  },
  // Derived system hues (à confirmer). The brand publishes no warning amber.
  system: {
    warning: "#b25e09" // derived warning amber, 4.67:1 on white (à confirmer)
  }
} as const;

// --- foundation (Ipsen-specific values) --------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family carries the brand navy: light section
    // tint, navy primary, hover blue.
    blue: {
      10: ipsenColor.blue.sectionBg, // #dbeaf5 slim-card blue ground
      60: ipsenColor.navy.primary, // #000e56 brand navy
      80: ipsenColor.navy.hover // #061f80 hover blue
    },
    // Sentropic "cyan" accent slot carries the measured light→primary blue
    // ramp (three brand utilities).
    cyan: {
      10: ipsenColor.blue.tint, // #e7faff `.light-blue`
      50: ipsenColor.blue.light, // #2797d3 `.primary-light-blue`
      70: ipsenColor.blue.primary // #224a81 `.primary-blue`
    },
    // Sentropic "slate" role family mapped onto the measured neutral scale.
    slate: {
      0: ipsenColor.grey.white, // white
      10: ipsenColor.grey.subtle, // #edebe4 warm neutral
      20: ipsenColor.grey.hairline, // #c4c9cb divider hairline
      60: ipsenColor.grey.dark, // #5d6265 secondary text
      80: ipsenColor.navy.primary, // #000e56 primary text navy
      90: ipsenColor.grey.charcoal // #292c31 editorial near-black
    },
    feedback: {
      success: ipsenColor.green.trueGreen, // #00b050 `.true-green` (gap noted)
      warning: ipsenColor.system.warning, // #b25e09 derived (à confirmer)
      error: ipsenColor.red.error, // #c02b0a validation red
      info: ipsenColor.blue.light // #2797d3 primary light blue
    }
  },
  // Rethink Sans is the brand typeface: four `@font-face` cuts
  // (RethinkSans-Regular/-Medium/-SemiBold, Rethinksans-bold) served from
  // the theme's own `dist/fonts/`; Lato cuts are declared but never consumed
  // (zero declarations outside `@font-face`). Headings use the bold cut, so
  // display shares the sans stack. Mono is the system stack (no mono face
  // published). We reference font *names* only, not binaries.
  font: {
    sans: "'Rethink Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Rethink Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // No spacing scale is published (arbitrary px insets); the standard rem
  // scale is retained (à confirmer).
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
  // Ipsen rounds at 8px: controls, cards, dropdowns (`border-radius:8px`
  // ×39 + corner pairs; rem root is the 16px default — no `html{font-size}`
  // anywhere). Checkbox 4px, pills 999px (measured).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px — checkbox
    md: "0.5rem", // 8px — buttons / inputs / tabs
    lg: "0.5rem", // 8px — cards (same step as controls, measured)
    pill: "999px" // pills
  },
  // Black-tinted shadows, transcribed verbatim (the chrome is otherwise
  // flat: `box-shadow:none` ×13).
  shadow: {
    subtle: "0 2px 4px rgba(0,0,0,.1)", // #masthead header shadow
    medium: "0px 4px 8px rgba(0,0,0,.15)", // graphic-card text panel
    floating: "0 4px 10px rgb(0 0 0/25%)" // megamenu dropdown
  },
  // All three durations measured (`.2s` ×4, `.3s` ×8, `.5s` ×25) with the
  // dominant easing (ease-in ×25 of 37 transitions).
  motion: {
    fast: "200ms",
    normal: "300ms",
    slow: "500ms",
    easing: "ease-in"
  },
  // No z-index system is published (ad hoc 1…2000); the base roles are
  // retained (à confirmer).
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Ipsen) --------------------------------------------
  // 1px / 2px solid strokes; zero dashed/dotted in the brand region.
  borderWidth: {
    none: "0",
    thin: "1px", // hairlines, checkbox
    thick: "2px" // `.form-control`, cards, tab filet
  },
  borderStyle: { solid: "solid" },
  // Control density. md transcribed from `.form-control` (50px tall,
  // 13px/15px insets, 16px text); the CTA alternative (15px/25px insets,
  // ≈50px tall) is recorded in MAPPING.md. No sm/lg variants are published
  // (empty grep, quoted in MAPPING.md) — sm/lg and the md gap/minWidth reuse
  // the Sentropic base (à confirmer).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.375rem", minWidth: "2rem", fontSize: "0.875rem" }, // à confirmer — base (no sm variant published)
    md: { controlHeight: "3.125rem", paddingBlock: "0.8125rem", paddingInline: "0.9375rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" }, // 50px / 13px / 15px / base gap+minWidth (à confirmer) / 16px
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" } // à confirmer — base (no lg variant published)
  },
  // Ipsen typography is Rethink Sans throughout: bold-cut 16px/20px CTA
  // labels, regular 16px fields and labels, navy links with no underline at
  // rest and none added on hover (hover is a colour shift to #061f80).
  // Content-area links (`text-parbase`, alert boxes) underline at rest —
  // recorded in MAPPING.md; no tracking and no text transform anywhere.
  typography: {
    control: { family: "'Rethink Sans', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Rethink Sans', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Rethink Sans', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "none", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // `.disabled` buttons: later rule wins over `opacity:.7`
  transition: { property: "background-color, color, box-shadow, transform", duration: "500ms", easing: "ease-in" }, // dominant property set + duration (.5s ×25) + easing (×25)
  cursor: { interactive: "pointer", disabled: "default", text: "text" }, // `.disabled` buttons use `cursor:default` (×5)
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" }, // à confirmer — base (only a 15px search clear-icon is published)
  // FOCUS = a navy OUTLINE: `outline:2px solid #000e56` + `outline-offset:2px`
  // on filter buttons, survey radios, search inputs. Text inputs keep
  // `outline:none` with a navy border recolour instead (recorded in
  // MAPPING.md); scoped variants (1px #061f80, 2px #0a58ca, 2px #dbdde8,
  // search `rgba(0,95,204,.95)`) are noted there too.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: ipsenColor.navy.primary, // #000e56 navy focus outline
    inset: "0"
  },
  // Form fields are BOXED (outline): `.form-control` is a white fill with a
  // 2px `#edebe4` border and an 8px radius. `style: "outline"` draws four
  // equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: ipsenColor.grey.white, // #ffffff
    underlineColor: ipsenColor.grey.subtle, // #edebe4 (unused for outline, kept for completeness)
    underlineWidth: "2px", // `.form-control` border width
    // Native <select>: `appearance:none` + a 7×6px `arrow-down.png` whose
    // pixels decode around #000e56 — redrawn here as a navy chevron. The
    // right gutter is not published (reference geometry, à confirmer).
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23000e56' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem" // à confirmer — reference geometry (no gutter published)
  },
  // Cards: a 2px `#edebe4` border + 8px radius on white; SemiBold 20px/24px
  // navy card titles; `#edebe4` hover wash on the download strip.
  card: {
    borderWidth: "2px",
    lineHeight: "1.5rem",
    hoverBackground: ipsenColor.grey.subtle // #edebe4
  },
  // Secondary button = OUTLINED navy on white (exit-modal scope): white
  // fill, navy border + text, hover fills `#153f99`.
  buttonSecondary: {
    background: "#ffffff", // later rule wins over the `#edebe4` fill
    border: ipsenColor.navy.primary, // #000e56 stroke
    hoverBackground: ipsenColor.navy.cardButton // #153f99 hover fill
  },
  // Tabs: borderless navy labels; active tab keeps navy text with a 2px
  // `#3286d6` bottom filet. Block padding is unmodified Bootstrap `.nav-link`
  // padding (vendor default retained); inline is zeroed by the brand.
  tabs: {
    activeText: ipsenColor.navy.primary, // #000e56 active label
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "400", // no weight published — inherited body weight
    paddingBlock: "0.5rem", // Bootstrap `.nav-link` block padding retained (brand overrides inline only)
    paddingInline: "0", // `.nav-tabs .nav-link` zeroes inline padding
    fontSize: "1rem", // inherited 16px
    lineHeight: "1.25rem", // inherited 20px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: borderless grey links; active page = filled navy with white
  // text, 8px radius. Last `.page-link` padding (5px/11px) wins.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: ipsenColor.grey.dark, // #5d6265 page links
    activeBackground: ipsenColor.navy.primary, // #000e56 filled active page
    activeText: "#ffffff", // white on navy, 17.54:1
    activeBorderWidth: "0",
    paddingBlock: "0.3125rem", // 5px
    paddingInline: "0.6875rem", // 11px
    minSize: "2.25rem", // à confirmer — reference geometry (no page-box size published)
    fontSize: "1rem", // inherited 16px
    lineHeight: "1.25rem" // inherited 20px
  },
  // Breadcrumb: the brand publishes no breadcrumb rules (one RTL-only line;
  // grep quoted in MAPPING.md) — reference geometry with brand greys
  // applied (à confirmer).
  breadcrumb: {
    linkText: ipsenColor.navy.primary, // #000e56 (à confirmer)
    text: ipsenColor.grey.dark, // #5d6265 (à confirmer)
    currentText: ipsenColor.navy.primary, // #000e56 (à confirmer)
    separator: ipsenColor.grey.hairline, // #c4c9cb (à confirmer)
    fontSize: "0.875rem", // à confirmer — reference geometry
    lineHeight: "1.5rem", // à confirmer — reference geometry
    currentWeight: "700" // à confirmer — reference geometry
  },
  // Alert: the brand publishes no alert-box geometry (empty grep, quoted in
  // MAPPING.md) — reference geometry (à confirmer).
  alert: {
    background: "transparent", // à confirmer — reference geometry
    borderTop: "none", // à confirmer — reference geometry
    borderRight: "none", // à confirmer — reference geometry
    borderBottom: "none", // à confirmer — reference geometry
    accentWidth: "0", // à confirmer — reference geometry
    filetWidth: "0.25rem", // à confirmer — reference geometry
    paddingTop: "1rem", // à confirmer — reference geometry
    paddingRight: "1rem", // à confirmer — reference geometry
    paddingBottom: "1rem", // à confirmer — reference geometry
    paddingLeft: "1.25rem", // à confirmer — reference geometry
    fontSize: "1rem", // à confirmer — reference geometry
    lineHeight: "1.5rem" // à confirmer — reference geometry
  },
  // Accordion: white bold-navy trigger (18px/22px, 1px `#2797d3` border,
  // 8px bottom radius); borderless items. Padding is asymmetric
  // (18.5px/27px/18.5px/24px) — inline-start 24px transcribed (see MAPPING.md).
  accordion: {
    text: ipsenColor.navy.primary, // #000e56 trigger label
    paddingBlock: "1.15625rem", // 18.5px
    paddingInline: "1.5rem", // 24px inline-start (right is 27px)
    fontSize: "1.125rem", // 18px (20px at ≥767px)
    fontWeight: "700", // Rethinksans-bold cut
    lineHeight: "1.375rem" // 22px
  },
  // Tag: the brand publishes no tag rules — reference geometry with the
  // brand subtle surface applied (à confirmer).
  tag: {
    radius: "4px", // à confirmer — reference geometry
    paddingBlock: "0.25rem", // à confirmer — reference geometry
    paddingInline: "0.5rem", // à confirmer — reference geometry
    fontSize: "0.875rem", // à confirmer — reference geometry
    fontWeight: "400", // à confirmer — reference geometry
    lineHeight: "1.5rem", // à confirmer — reference geometry
    minHeight: "1.5rem", // à confirmer — reference geometry
    neutralBackground: ipsenColor.grey.subtle, // #edebe4 (à confirmer)
    neutralText: ipsenColor.navy.primary // #000e56 (à confirmer)
  },
  // Badge: the brand publishes no badge rules — reference geometry, navy
  // fill with white text for AA contrast (à confirmer).
  badge: {
    radius: "4px", // à confirmer — reference geometry
    paddingBlock: "0", // à confirmer — reference geometry
    paddingInline: "0.5rem", // à confirmer — reference geometry
    fontSize: "0.875rem", // à confirmer — reference geometry
    fontWeight: "700", // à confirmer — reference geometry
    lineHeight: "1.5rem", // à confirmer — reference geometry
    textTransform: "none", // à confirmer — reference geometry
    minHeight: "1.5rem", // à confirmer — reference geometry
    infoBackground: ipsenColor.navy.primary, // #000e56 (à confirmer)
    infoText: "#ffffff" // white on navy, 17.54:1 (à confirmer)
  },
  // Checkbox/radio label: regular 16px/20px navy; 1px navy box, 4px radius,
  // navy checked fill + tick asset. No radio line geometry is published.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.5rem", // à confirmer — reference geometry
    labelColor: ipsenColor.navy.primary // #000e56
  },
  // Search input: regular 16px/20px navy on `.form-control` geometry with
  // the inline-start padding zeroed (right inset 15px transcribed).
  search: {
    paddingBlock: "0.8125rem", // 13px
    paddingInline: "0.9375rem", // 15px right inset (left is zeroed)
    fontSize: "1rem", // 16px
    lineHeight: "1.25rem" // 20px
  },
  // Toggle: the brand publishes no switch component (only the navbar
  // hamburger + an accessibility-widget position) — reference geometry with
  // the brand label colour applied (à confirmer).
  toggle: {
    trackPadding: "0", // à confirmer — reference geometry
    lineHeight: "1.5rem", // à confirmer — reference geometry
    textColor: ipsenColor.navy.primary // #000e56 (à confirmer)
  }
} as const;

// --- semantic (Ipsen-specific role mapping) -----------------------------------
const semantic = {
  surface: {
    default: ipsenColor.grey.white, // white (cards / fields / modal grounds)
    subtle: ipsenColor.grey.subtle, // #edebe4 quote/tab/drop grounds
    raised: ipsenColor.grey.white, // white
    inverse: ipsenColor.navy.primary, // #000e56 footer ground
    overlay: "rgb(255 255 255 / 0.8)" // `.modal-backdrop`: later `#fff` + `.8` rule wins over `#000`
  },
  text: {
    primary: ipsenColor.navy.primary, // #000e56 body text, 17.54:1
    secondary: ipsenColor.grey.dark, // #5d6265 `.dark-grey`, 6.18:1
    muted: ipsenColor.grey.muted, // #8f9699 file-size/disabled text, 3.00:1 — documented arbitration
    inverse: ipsenColor.grey.white, // white footer text on navy, 17.54:1
    link: ipsenColor.navy.primary // #000e56 bare-`a` default (hover #061f80), 17.54:1
  },
  border: {
    subtle: ipsenColor.grey.subtle, // #edebe4 `.form-control` 2px stroke
    strong: ipsenColor.grey.hairline, // #c4c9cb card + divider strokes
    interactive: ipsenColor.blue.primary // #224a81 `.primary-blue`, 8.88:1
  },
  action: {
    primary: ipsenColor.navy.primary, // #000e56 `.btn-primary` / `.section-btn` fill
    primaryHover: ipsenColor.navy.hover, // #061f80 site-wide button hover
    primaryText: "#ffffff", // white on navy, 17.54:1
    secondary: ipsenColor.grey.subtle, // #edebe4 light-button fill
    secondaryHover: ipsenColor.navy.hover, // #061f80 light-button hover fill
    secondaryText: ipsenColor.navy.primary, // #000e56 on #edebe4, 14.70:1
    danger: ipsenColor.red.error // #c02b0a validation red, 5.85:1
  },
  feedback: {
    success: ipsenColor.green.trueGreen, // #00b050 `.true-green` (gap noted)
    warning: ipsenColor.system.warning, // #b25e09 derived, 4.67:1 (à confirmer)
    error: ipsenColor.red.error, // #c02b0a
    info: ipsenColor.blue.light // #2797d3
  },
  status: {
    pending: ipsenColor.system.warning, // derived amber (à confirmer)
    processing: ipsenColor.blue.light, // #2797d3 info blue
    completed: ipsenColor.green.trueGreen, // #00b050 (gap noted)
    failed: ipsenColor.red.error // #c02b0a
  },
  // Categorical data-vis palette. Ipsen publishes no sequential scale, so
  // this is a coherent proposal from measured brand hues (see MAPPING.md,
  // "à confirmer").
  data: {
    category1: ipsenColor.navy.primary, // #000e56 brand navy (à confirmer)
    category2: ipsenColor.blue.primary, // #224a81 primary blue (à confirmer)
    category3: ipsenColor.blue.light, // #2797d3 light blue (à confirmer)
    category4: ipsenColor.blue.nav, // #3286d6 nav blue (à confirmer)
    category5: ipsenColor.green.trueGreen, // #00b050 green (à confirmer)
    category6: ipsenColor.green.vibrant, // #b2c966 lime (à confirmer)
    category7: ipsenColor.red.error, // #c02b0a red (à confirmer)
    category8: ipsenColor.grey.dark // #5d6265 grey (à confirmer)
  }
} as const;

/**
 * The Ipsen theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Ipsen-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the navy brand reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const ipsenTheme: TenantTheme = {
  id: "ipsen",
  label: "Ipsen",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default ipsenTheme;
