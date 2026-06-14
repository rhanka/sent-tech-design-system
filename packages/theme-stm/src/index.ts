import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * STM — Société de transport de Montréal (stm.info) theme for the Sentropic
 * token structure.
 *
 * STM is the public-transit authority of Montréal. The values below are
 * MEASURED from the public stm.info CSS (computed colours / greyscale), except
 * the font names, radii and the secondary green / status hues which were not
 * sourceable from CSS and are flagged "à confirmer" (kept as sensible
 * transit-UI defaults). We reference font *names* only — never binaries.
 * Sources and the full provenance ledger are in MAPPING.md.
 *
 * STM colour reference (light theme):
 *   STM blue (signature / action / link)  #009ee0  (measured cyan-blue)
 *   STM blue hover (darkened)              #0084bd  (à confirmer — darkened)
 *   Ink / text primary                     #3c3c3c  (measured)
 *   Text secondary                          #515151  (measured)
 *   Text muted                              #888888  (à confirmer)
 *   Surface subtle (grey alt bg)            #ebebeb  (measured)
 *   Border subtle                           #cccccc  (measured)
 *   STM transit green (accessibility/bus)   #008f4c  (à confirmer — accent)
 *   Danger / red                            #d0021b  (à confirmer)
 *   Warning / amber                         #f5a623  (à confirmer)
 */

// --- STM raw colour palette (measured from stm.info) -----------------------
const stmColor = {
  // STM signature cyan-blue — the brand / action / link family.
  blue: {
    main: "#009ee0", // measured STM blue (action / link / interactive)
    hover: "#0084bd", // à confirmer — darkened STM blue for hover/active
    light: "#e0f4fc" // light blue tint for low-emphasis surfaces (derived — à confirmer)
  },
  // STM transit green — bus / accessibility green; used as a data/accent hue.
  green: {
    main: "#008f4c", // à confirmer — STM transit green (accent / success)
    light: "#e0f0e8" // light green tint (derived — à confirmer)
  },
  // Neutral grey scale (measured stm.info greys).
  grey: {
    0: "#ffffff", // white — surface default / inverse text
    50: "#ebebeb", // measured — subtle grey alt surface
    300: "#cccccc", // measured — subtle border
    500: "#888888", // à confirmer — muted text
    600: "#515151", // measured — secondary text / strong border
    800: "#3c3c3c" // measured — primary ink / inverse surface
  },
  // System / status colours. STM does not publish these as CSS tokens; the
  // values are picked to stay WCAG AA on white (à confirmer).
  system: {
    success: "#008f4c", // STM transit green (à confirmer)
    error: "#d0021b", // danger red (à confirmer)
    warning: "#f5a623", // amber (à confirmer)
    info: "#009ee0" // STM blue (info notice, à confirmer)
  }
} as const;

// --- foundation (STM-specific values) --------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the STM signature blue.
    blue: {
      10: stmColor.blue.light, // lightest blue tint
      60: stmColor.blue.main, // STM blue (primary)
      80: stmColor.blue.hover // darker interactive blue
    },
    // STM has no cyan distinct from its blue; the closest accent is the STM
    // transit green, so the Sentropic "cyan" accent slot maps to the green.
    cyan: {
      10: stmColor.green.light, // light green tint
      50: stmColor.green.main, // STM transit green accent
      70: "#006e3a" // darker green (derived — à confirmer)
    },
    // Sentropic "slate" role family mapped onto the STM grey scale.
    slate: {
      0: stmColor.grey[0], // white
      10: stmColor.grey[50], // #ebebeb background alt
      20: stmColor.grey[300], // #cccccc subtle border
      60: stmColor.grey[600], // #515151 secondary text
      80: stmColor.grey[800], // #3c3c3c primary ink
      90: "#1f1f1f" // darkest (derived — à confirmer)
    },
    feedback: {
      success: stmColor.system.success,
      warning: stmColor.system.warning,
      error: stmColor.system.error,
      info: stmColor.system.info
    }
  },
  // STM's exact webfont was not sourceable; the public site renders a clean
  // transit sans (Helvetica Neue stack). We reference the font *names* only.
  font: {
    sans: "'Helvetica Neue', Arial, Roboto, sans-serif", // à confirmer
    display: "'Helvetica Neue', Arial, Roboto, sans-serif", // à confirmer
    mono: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity).
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
  // STM radii were not sourced from CSS; transit UIs use mild rounding (à confirmer).
  radius: {
    none: "0",
    sm: "0.125rem", // 2px
    md: "0.25rem", // 4px — button / input / tabs
    lg: "0.5rem", // 8px — cards
    pill: "999px" // tags / pills
  },
  // Neutral elevation tinted with the STM ink. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(60 60 60 / 0.10)",
    medium: "0 4px 12px rgb(60 60 60 / 0.14)",
    floating: "0 8px 24px rgb(60 60 60 / 0.18)"
  },
  // Motion durations are not tokenised by STM publicly; kept aligned with the
  // Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not STM-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (STM) --------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // STM control density — touch-friendly transit UI; md targets a comfortable
  // tap height with generous horizontal padding (à confirmer).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // STM typography: one clean transit sans across interactive/labels/body.
  typography: {
    control: { family: "'Helvetica Neue', Arial, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Helvetica Neue', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Helvetica Neue', Arial, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // STM links are STM-blue; underline on hover (transit-site convention).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.08em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.55",
  transition: { property: "background-color, border-color, color, outline-color", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // STM FOCUS = a 2px OUTLINE in the STM blue (à confirmer — strategy/width).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "1px",
    color: stmColor.blue.main, // #009ee0 STM blue
    inset: "0"
  },
  // STM form fields are BOXED (outline): a white fill with a 1px #cccccc border
  // and a mild radius. `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: stmColor.grey[0], // #ffffff
    underlineColor: stmColor.grey[300], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in STM blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23009ee0' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // STM cards: a 1px grey border + slight radius, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: stmColor.grey[50] // #ebebeb
  },
  // STM secondary button = a light-grey filled button (transit UI convention),
  // darker grey on hover (à confirmer).
  buttonSecondary: {
    background: stmColor.grey[50], // #ebebeb
    border: stmColor.grey[300], // #cccccc stroke
    hoverBackground: stmColor.grey[300] // #cccccc on hover
  },
  // STM tabs / top-nav: active tab has a BOTTOM blue underline (border mode),
  // blue bold label, transparent fill.
  tabs: {
    activeText: stmColor.blue.main, // #009ee0
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // underline sits on the bottom edge
    indicatorMode: "border" // a real bottom border (not a box-shadow filet)
  },
  // STM pagination: borderless blue text links; active page = filled blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: stmColor.blue.main, // #009ee0 link text
    activeBackground: stmColor.blue.main, // #009ee0 filled active page
    activeText: stmColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // STM breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: stmColor.blue.main, // #009ee0
    text: stmColor.grey[600], // #515151 trail text
    currentText: stmColor.grey[800], // #3c3c3c current page
    separator: stmColor.grey[300], // #cccccc
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700" // current page is emphasised
  },
  // STM notice / alert: a coloured LEFT accent filet on a transparent box.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // STM details: a dark bold summary trigger.
  accordion: {
    text: stmColor.grey[800], // #3c3c3c summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // STM tag: a small 4px-radius grey chip.
  tag: {
    radius: "4px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: stmColor.grey[50], // #ebebeb
    neutralText: stmColor.grey[800] // #3c3c3c
  },
  // STM badge: a 4px-radius filled badge.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: stmColor.blue.main, // #009ee0
    infoText: stmColor.grey[0] // white
  },
  // STM checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: stmColor.grey[800] // #3c3c3c
  },
  // STM search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // STM toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: stmColor.grey[800] // #3c3c3c
  }
} as const;

// --- semantic (STM-specific role mapping) ----------------------------------
const semantic = {
  surface: {
    default: stmColor.grey[0], // white
    subtle: stmColor.grey[50], // #ebebeb background alt (measured)
    raised: stmColor.grey[0], // white
    inverse: stmColor.grey[800], // #3c3c3c dark ink inverse surface (measured)
    overlay: "rgb(60 60 60 / 0.6)" // modal backdrop (ink tint)
  },
  text: {
    primary: stmColor.grey[800], // #3c3c3c (measured)
    secondary: stmColor.grey[600], // #515151 (measured)
    muted: stmColor.grey[500], // #888888 (à confirmer)
    inverse: stmColor.grey[0], // white on dark / coloured surfaces
    link: stmColor.blue.main // #009ee0 STM blue
  },
  border: {
    subtle: stmColor.grey[300], // #cccccc (measured)
    strong: stmColor.grey[600], // #515151
    interactive: stmColor.blue.main // #009ee0 STM blue
  },
  action: {
    primary: stmColor.blue.main, // #009ee0 primary button
    primaryHover: stmColor.blue.hover, // #0084bd darker hover (à confirmer)
    primaryText: stmColor.grey[0], // white text on blue
    secondary: stmColor.grey[50], // #ebebeb secondary surface
    secondaryHover: stmColor.grey[300], // #cccccc
    secondaryText: stmColor.grey[800], // #3c3c3c
    danger: stmColor.system.error // #d0021b
  },
  feedback: {
    success: stmColor.system.success,
    warning: stmColor.system.warning,
    error: stmColor.system.error,
    info: stmColor.system.info
  },
  status: {
    pending: stmColor.system.warning,
    processing: stmColor.system.info,
    completed: stmColor.system.success,
    failed: stmColor.system.error
  },
  // Categorical data-vis palette assembled from the STM brand hues. STM does
  // not publish an 8-colour sequential scale, so this is a coherent proposal
  // built from blue, green, greys and complementary transit hues (see
  // MAPPING.md, "à confirmer").
  data: {
    category1: stmColor.blue.main, // STM blue
    category2: stmColor.green.main, // STM transit green
    category3: stmColor.grey[600], // grey
    category4: stmColor.blue.hover, // darker blue
    category5: stmColor.system.warning, // amber
    category6: stmColor.system.error, // red
    category7: stmColor.grey[300], // light grey
    category8: stmColor.grey[800] // ink
  }
} as const;

/**
 * The STM theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry STM-specific values, and the `component`
 * layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the STM brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const stmTheme: TenantTheme = {
  id: "stm",
  label: "STM",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default stmTheme;
