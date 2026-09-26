import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Rexel brand theme for the Sentropic token structure.
 *
 * Rexel Group publishes a tokenised public design system (`ds-rexel` on npm,
 * live at design.rexel.com) whose France theme (`$primary-600: #2e4eaa`,
 * DEFAULT BUTTON COLOR) is read from the public SCSS sources. This package is
 * a MEASURED-CLONE mapping: brand values are transcribed from those sources and
 * we reference the brand font *names* ("open sans", Montserrat) only — never
 * font binaries. Sources and exact provenance are documented in MAPPING.md.
 * Where the DS publishes no direct equivalent for a Sentropic role, the
 * closest derived value is used and noted "à confirmer" in MAPPING.md.
 *
 * Rexel colour reference (France theme, light):
 *   White (fills / resting pages)          #ffffff   (surface default)
 *   Background alt (DEFAULT BACKGROUND)    #f3f3fa   (gray-50)
 *   Field stroke / hairlines               #D7D9E4   (gray-100)
 *   Breadcrumb link grey                   #596179   (gray-600)
 *   Muted text grey ($text-muted)           #666F8A   (gray-500)
 *   Body / headings near-black             #303545   (gray-900)
 *   Primary brand blue (DEFAULT BUTTON)    #2e4eaa   (primary-600)
 *   Primary hover (lighter — measured)     #3556b4   (primary-500)
 *   Deep primary (progress, badges)        #0a287d   (primary-900)
 *   Light primary tint                     #e8ebf6   (primary-50)
 *   Secondary blue (DEFAULT 2nd BUTTON)    #4487bd   (secondary-700)
 *   Secondary hover (lighter — measured)   #4c99d1   (secondary-600)
 *   Success green                          #16704a   (green)
 *   Warning orange                         #EE7900   (orange)
 *   Error red                              #C8102E   (red)
 *   Info blue                              #0072CE   (blue)
 *   Deep navy (footer, tertiary)           #092268   (tertiary)
 *   Promo orange                           #ec6507   (promo button)
 */

// --- Rexel raw colour palette ------------------------------------------------
// Counting convention (every figure below and in MAPPING.md): occurrences of
// the 6-digit hexadecimal form, case-insensitive, normalised to lowercase;
// short forms (#333, #000) expanded before counting; rgb()/rgba() equivalents
// reported without merging; region = brand files
// (scss/rexel/_theme_rexel.scss, scss/common/_variables_rexel_DS.scss,
// scss/common/_custom_components.scss); vendor/ directory and the bootstrap
// import excluded. $var references = exact-spelling uses of the brand SCSS
// variable (declaration included) over the brand region — `$warning` does not
// absorb `$warning-light` or `$warning-info-icon`.
const rexelColor = {
  // Brand blue family — the France theme primary scale. $primary-600 is the
  // DEFAULT BUTTON COLOR ($primary, 47 $primary-600 refs + 97 $primary refs).
  blue: {
    50: "#e8ebf6", // $primary-50 ($dropdown-link-hover-bg, facet active fills — 16 refs)
    500: "#3556b4", // $primary-500 ($primary-hover, outline-btn hover — 18 refs)
    600: "#2e4eaa", // $primary-600 (DEFAULT BUTTON COLOR — 47 refs)
    900: "#0a287d" // $primary-900 (progress bar, badge-primary — 38 refs)
  },
  // Accent blue family — $secondary-700 is the DEFAULT 2nd BUTTON COLOR.
  accent: {
    50: "#e3f5fc", // $secondary-50 ($breadcrumb-hover — 3 refs)
    500: "#52a7e0", // $secondary-500 (scale step — declaration + palette map, 2 refs; no consumer rule)
    600: "#4c99d1", // $secondary-600 ($secondary-hover, lighter — 5 refs)
    700: "#4487bd" // $secondary-700 ($secondary DEFAULT BUTTON — 8 refs)
  },
  // Tinted grey scale (brand-declared $gray-* ramp, France theme).
  slate: {
    0: "#ffffff", // $white (fills, outline-btn bg — 109 $white refs)
    50: "#f3f3fa", // $gray-50 ($background-color DEFAULT BACKGROUND — 25 refs)
    100: "#D7D9E4", // $gray-100 (field stroke, pagination borders — 84 refs)
    400: "#838AA1", // $gray-400 (switch track off, control borders — 23 refs)
    500: "#666F8A", // $gray-500 ($text-muted — 47 refs)
    600: "#596179", // $gray-600 (breadcrumb links — 14 refs)
    800: "#3E4457", // $gray-800 (large-pill text, pill switch fills — 9 refs; brand-consumed, no Sentropic role: palette reference)
    900: "#303545" // $gray-900 ($body-color, $headings-color — 54 refs)
  },
  // Deep navy (footer backgrounds: .responsiveFooterBackgroundTop = $tertiary-500,
  // .responsiveFooterBackgroundMain = $tertiary-700, .responsiveFooterBackgroundBottom
  // = $tertiary-800 — _variables_rexel_DS.scss footer block).
  navy: "#092268", // $tertiary = $tertiary-500 (footer top background)
  navyDeep: "#02081A", // $tertiary-800 (footer bottom background)
  // System / status colours (brand-declared $green/$orange/$red/$blue).
  system: {
    success: "#16704a", // $green = $success (switch on, alerts — 37 $success refs)
    warning: "#EE7900", // $orange = $warning (17 $warning refs)
    error: "#C8102E", // $red = $danger (18 $danger refs)
    info: "#0072CE" // $blue = $info (7 $info refs)
  },
  // Promo orange (brand-declared $promo-color-button — 4 refs).
  promo: "#ec6507" // $promo-color-button (btn-promo fill, white text)
} as const;

// --- foundation (Rexel-specific values) --------------------------------------
const foundation = {
  color: {
    // Rexel HAS a dominant brand BLUE: the Sentropic "blue" role family
    // carries the France-theme primary ($primary-600 action blue).
    blue: {
      10: rexelColor.blue[50], // #e8ebf6 light primary tint
      60: rexelColor.blue[600], // #2e4eaa DEFAULT BUTTON COLOR
      80: rexelColor.blue[900] // #0a287d deep primary
    },
    // Sentropic "cyan" accent slot carries the secondary blue accent
    // ($secondary family).
    cyan: {
      10: rexelColor.accent[50], // #e3f5fc light accent tint
      50: rexelColor.accent[500], // #52a7e0 mid accent
      70: rexelColor.accent[700] // #4487bd DEFAULT 2nd BUTTON COLOR
    },
    // Sentropic "slate" role family mapped onto the tinted grey ramp.
    slate: {
      0: rexelColor.slate[0], // white
      10: rexelColor.slate[50], // background alt
      20: rexelColor.slate[100], // subtle borders / field stroke
      60: rexelColor.slate[600], // secondary text
      80: rexelColor.slate[900], // primary text
      90: rexelColor.navyDeep // #02081A footer-bottom navy (darkest)
    },
    feedback: {
      success: rexelColor.system.success,
      warning: rexelColor.system.warning,
      error: rexelColor.system.error,
      info: rexelColor.system.info
    }
  },
  // Rexel's DS ships "open sans" as its base typeface
  // ($font-family-sans-serif) and Montserrat for h1/h2
  // ($font-family-montserrat). Mono is the sans stack itself
  // ($font-family-monospace: "open sans" — measured quirk, no real
  // monospace published). We reference the font *names* only.
  font: {
    sans: "'Open Sans', 'open sans', sans-serif",
    display: "'Montserrat', sans-serif",
    mono: "'Open Sans', 'open sans', sans-serif"
  },
  // Rem spacing scale, 16px root (no html font-size override in the DS).
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
  // Rexel radius is tight: $border-radius .1875rem (3px) everywhere,
  // $modal-content-border-radius 0.375rem (6px) for large surfaces.
  radius: {
    none: "0",
    sm: "0.1875rem", // 3px — $border-radius (buttons, fields)
    md: "0.1875rem", // 3px — fields, tabs
    lg: "0.375rem", // 6px — $modal-content-border-radius
    pill: "999px" // pills/tags
  },
  // Brand elevation: pure-black shadows ($box-shadow-sm / $box-shadow /
  // $box-shadow-lg use rgba($black, .1)).
  shadow: {
    subtle: "0 0.125rem 0.25rem rgb(0 0 0 / 0.1)", // $box-shadow-sm
    medium: "0 0.3125rem 0.5rem rgb(0 0 0 / 0.1)", // $box-shadow
    floating: "0 0.5625rem 0.625rem rgb(0 0 0 / 0.1)" // $box-shadow-lg
  },
  // Only the easing is brand-published ($easeInOutCubic); durations follow
  // the Sentropic base (à confirmer).
  motion: {
    fast: "120ms", // base — à confirmer
    normal: "180ms", // base — à confirmer
    slow: "280ms", // base — à confirmer
    easing: "cubic-bezier(0.645, 0.045, 0.355, 1)" // $easeInOutCubic
  },
  // z-index roles are not brand-specific; Sentropic base (à confirmer).
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Rexel) -------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // $border-width — field/input borders
    thick: "2px" // custom-control-label::before 2px border (checked box/radio)
  },
  borderStyle: { solid: "solid" },
  // Control density. md/sm heights computed from the brand formula
  // ($input-line-height 1.5 × $font-size-base .875rem = 21px, + paddings);
  // md paddings ($input-padding-y, $input-btn-padding-x) and the three
  // fontSize steps ($font-size-sm/base/lg) are brand values — see MAPPING.md.
  // lg.controlHeight, all minWidth, md/lg gap and sm/lg paddingBlock follow
  // the base (à confirmer). sm.paddingInline, sm.gap and lg.paddingInline are
  // aligned with the reference theme package's geometry (à confirmer).
  density: {
    sm: { controlHeight: "1.75rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.75rem" },
    md: { controlHeight: "2.375rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.875rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Rexel typography: Open Sans everywhere; buttons semibold .875rem with a
  // 1.3571 line-height; fields .875rem/400/1.5; labels carry the base size
  // (weight à confirmer — no distinct label token published).
  typography: {
    control: { family: "'Open Sans', 'open sans', sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.3571", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Open Sans', 'open sans', sans-serif", size: "0.875rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Open Sans', 'open sans', sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links render $gray-900 at rest (last rule wins — see MAPPING.md),
    // $primary-600 on hover, and are NEVER underlined (not even .text-primary
    // except on its own hover/focus).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "none", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // $btn-disabled-opacity (brand, against Bootstrap stock .65)
  // Transition: duration is the base; easing is brand ($easeInOutCubic);
  // property is aligned with the reference theme package's geometry
  // (à confirmer — no $transition-* published by the brand).
  transition: { property: "background-color, border-color, color, box-shadow", duration: "120ms", easing: "cubic-bezier(0.645, 0.045, 0.355, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  // Icon sizes: sm is the brand indicator ($input-control-indicator-size);
  // lg is the search-icon render size (.form-search background-size
  // $spacer × 1.25 with $spacer: 1rem); md follows the base (à confirmer).
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a translucent brand-blue RING: `box-shadow: 0 0 0 0.2rem
  // rgba($primary, .25); outline: 0` on focused controls (input-group
  // .form-control, .focussed wrappers, date-picker inputs). Solid #2e4eaa
  // clears 7.54:1; the rendered wash is 25% alpha over the surface.
  focus: {
    strategy: "ring",
    width: "0.2rem",
    offset: "0",
    color: rexelColor.blue[600], // #2e4eaa $primary ring colour
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px $gray-100 border on
  // all four sides (`.form-control { border: $input-border-width solid
  // $gray-100 }`), 3px radius. `style: "outline"` makes the builder draw four
  // equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: rexelColor.slate[0], // #ffffff
    underlineColor: rexelColor.slate[100], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: appearance none is measured; the chevron redraws in
    // $primary on hover ($select-dropdown-primary), black at rest — the
    // primary variant is drawn, both states recorded in MAPPING.md.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%232e4eaa' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.625rem center",
    selectPaddingRight: "1.625rem" // à confirmer — computed gutter (0.625rem offset + 1rem icon), no padding-right published
  },
  // Cards: borderless, shadow-lifted ($card-box-shadow), white header, hover
  // deepens the shadow only (no fill change).
  card: {
    borderWidth: "0",
    lineHeight: "1.25",
    hoverBackground: rexelColor.slate[0] // #ffffff — no hover tint published
  },
  // Secondary button = OUTLINED in primary blue on white: $primary-outlined
  // text + border, white fill kept on hover (text shifts to $primary-500).
  buttonSecondary: {
    background: "#ffffff",
    border: rexelColor.blue[600], // #2e4eaa $primary-outlined stroke
    hoverBackground: "#ffffff" // hover keeps the white fill (measured)
  },
  // Tabs: inactive labels near-black semibold .875rem; active tab =
  // $primary-600 label on transparent with a 4px bottom border
  // (border-bottom-width: $border-width * 4).
  tabs: {
    activeText: rexelColor.blue[600], // #2e4eaa active tab label
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.875rem 0.75rem",
    paddingInline: "1.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25",
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: $primary-600 page links on white with $gray-100 borders;
  // active page = $gray-900 text on $gray-50 (measured $pagination-active-*).
  pagination: {
    background: "#ffffff",
    border: rexelColor.slate[100], // #D7D9E4 all-state page border
    borderWidth: "1px",
    text: rexelColor.blue[600], // #2e4eaa $pagination-color
    activeBackground: rexelColor.slate[50], // #f3f3fa $pagination-active-bg
    activeText: rexelColor.slate[900], // #303545 $pagination-active-color
    activeBorderWidth: "1px",
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    minSize: "2.25rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem"
  },
  // Breadcrumb: $gray-600 links ($primary-600 on hover), $gray-900 current
  // page (measured .breadcrumb-item rules).
  breadcrumb: {
    linkText: rexelColor.slate[600], // #596179
    text: rexelColor.slate[600], // #596179 trail text
    currentText: rexelColor.slate[900], // #303545 current page
    separator: rexelColor.slate[500], // #666F8A — à confirmer (default muted)
    fontSize: "inherit",
    lineHeight: "normal",
    currentWeight: "600"
  },
  // Alert: tinted 1px boxes per severity (four measured tints in MAPPING.md).
  // Single-slot representative = the info tint; severity accents override.
  alert: {
    background: "#d9eaf8", // $alert-info-bg-color (representative — à confirmer)
    borderTop: "1px solid #bfdcf3", // $alert-info-border-color
    borderRight: "1px solid #bfdcf3",
    borderBottom: "1px solid #bfdcf3",
    accentWidth: "0",
    filetWidth: "0",
    paddingTop: "1rem",
    paddingRight: "1rem",
    paddingBottom: "1rem",
    paddingLeft: "1rem",
    fontSize: "inherit",
    lineHeight: "normal",
    accentInfo: "#055ea5", // $alert-info-color
    accentSuccess: "#16704a", // $alert-success-color
    accentWarning: "#9b540c", // $alert-warning-color
    accentError: "#721c24" // $alert-danger-color
  },
  // Accordion trigger: near-black label (body chain); geometry follows the
  // base (à confirmer — no trigger token published).
  accordion: {
    text: rexelColor.slate[900], // #303545 $body-color chain
    paddingBlock: "0.875rem",
    paddingInline: "0.5rem",
    fontSize: "inherit",
    fontWeight: "600",
    lineHeight: "normal"
  },
  // Tag: tight brand-radius chip on the subtle surface.
  tag: {
    radius: "0.1875rem",
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    lineHeight: "1",
    minHeight: "0",
    neutralBackground: rexelColor.slate[50], // #f3f3fa = surface.subtle
    neutralText: rexelColor.slate[600] // #596179 = text.secondary
  },
  // Badge: Bootstrap pill (10rem) with the large-pill metrics (6px 15px,
  // .875rem/normal); weight 600 is brand ($badge-font-weight:
  // $font-weight-semi-bold); INFO tone = measured default-badge primary pair.
  badge: {
    radius: "10rem",
    paddingBlock: "6px",
    paddingInline: "15px",
    fontSize: "0.875rem",
    fontWeight: "600",
    lineHeight: "normal",
    textTransform: "none",
    minHeight: "0",
    infoBackground: "#D6E5F5", // $default-badge-primary-bg
    infoText: "#223361" // $default-badge-primary-color (9.56:1)
  },
  // Checkbox/radio label (body chain).
  choice: {
    labelFontSize: "0.875rem",
    labelLineHeight: "1.25",
    radioLineHeight: "1.25",
    labelColor: rexelColor.slate[900] // #303545 $body-color chain
  },
  // Search input (measured .form-search metrics + icon).
  search: {
    paddingBlock: "0.5rem", // $input-padding-y
    paddingInline: "0.75rem", // $input-btn-padding-x
    fontSize: "0.875rem",
    lineHeight: "1.5" // $input-line-height
  },
  // Toggle: $gray-400 resting track, $success checked track, white thumb.
  toggle: {
    trackPadding: "0.25rem",
    lineHeight: "1.25",
    textColor: rexelColor.slate[900], // #303545 $body-color chain
    trackColor: rexelColor.slate[400], // #838AA1 resting track
    trackCheckedColor: rexelColor.system.success, // #16704a checked track
    thumbColor: "#ffffff" // white thumb
  }
} as const;

// --- semantic (Rexel-specific role mapping) ----------------------------------
const semantic = {
  surface: {
    default: rexelColor.slate[0], // white (fills — vendor default retained)
    subtle: rexelColor.slate[50], // #f3f3fa $background-color
    raised: rexelColor.slate[0], // white
    inverse: rexelColor.slate[900], // #303545 $body-color near-black
    overlay: "rgb(48 53 69 / 0.6)" // derived $gray-900 veil (à confirmer)
  },
  text: {
    primary: rexelColor.slate[900], // #303545 $body-color (12.20:1)
    secondary: rexelColor.slate[600], // #596179 (6.16:1)
    muted: rexelColor.slate[500], // #666F8A $text-muted (4.99:1)
    inverse: rexelColor.slate[0], // white on dark / coloured surfaces
    link: rexelColor.blue[600] // #2e4eaa link-hover identity (7.54:1)
  },
  border: {
    subtle: rexelColor.slate[100], // #D7D9E4 field stroke (84 refs)
    strong: rexelColor.slate[400], // #838AA1 (3.43:1, line bar)
    interactive: rexelColor.blue[600] // #2e4eaa (7.54:1)
  },
  action: {
    primary: rexelColor.blue[600], // #2e4eaa DEFAULT BUTTON COLOR
    primaryHover: rexelColor.blue[500], // #3556b4 lighter hover (measured)
    primaryText: "#ffffff", // white btn text (7.54:1 — vendor color-yiq)
    secondary: rexelColor.accent[700], // #4487bd DEFAULT 2nd BUTTON COLOR
    secondaryHover: rexelColor.accent[600], // #4c99d1 lighter hover (measured)
    secondaryText: "#ffffff", // white btn text (3.86:1 — documented arbitration)
    danger: rexelColor.system.error // #C8102E (5.88:1)
  },
  feedback: {
    success: rexelColor.system.success,
    warning: rexelColor.system.warning,
    error: rexelColor.system.error,
    info: rexelColor.system.info
  },
  status: {
    pending: rexelColor.system.warning,
    processing: rexelColor.system.info,
    completed: rexelColor.system.success,
    failed: rexelColor.system.error
  },
  // Categorical palette from measured brand hues (assignment à confirmer —
  // the DS publishes no 8-colour sequential scale).
  data: {
    category1: rexelColor.blue[600], // #2e4eaa primary
    category2: rexelColor.accent[700], // #4487bd secondary
    category3: rexelColor.system.success, // #16704a
    category4: rexelColor.system.warning, // #EE7900
    category5: rexelColor.system.error, // #C8102E
    category6: rexelColor.system.info, // #0072CE
    category7: rexelColor.navy, // #092268 tertiary navy
    category8: rexelColor.promo // #ec6507 promo orange
  }
} as const;

/**
 * The Rexel theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Rexel-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Rexel blue reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const rexelTheme: TenantTheme = {
  id: "rexel",
  label: "Rexel",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default rexelTheme;
