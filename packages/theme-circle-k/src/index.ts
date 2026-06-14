import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * CIRCLE K (circlek.com — the global convenience-store brand of Alimentation
 * Couche-Tard, the Laval/Montréal-HQ retailer) theme for the Sentropic token
 * structure.
 *
 * Circle K's identity is a CLEAN RED-ON-WHITE RETAIL system: the signature
 * CIRCLE K RED (#DA291C — the brand red, measured from circlek.com CSS) drives
 * every primary CTA, link and brand accent; ink is a near-black #1a1a1a on white
 * surfaces with a faint grey #f2f2f2 page tint; and a warm ORANGE (#F58220) from
 * the Circle K logo mark serves as a decorative accent. The red, ink and grey
 * scale below are MEASURED from circlek.com's stylesheets; fonts, radii, the
 * orange accent and the status/feedback hues are DERIVED and flagged
 * "à confirmer" in MAPPING.md.
 *
 * Form fields are BOXED outlines (white fill, thin grey #e0e0e0 stroke); focus is
 * a 2px red outline in the brand red #DA291C. Typography is a clean retail sans
 * (the Helvetica Neue / Arial family — names only, not sourced from @font-face,
 * "à confirmer"). Where Sentropic needs a role Circle K does not publish, the
 * closest measured hex is used and the choice is noted "à confirmer" in
 * MAPPING.md.
 *
 * Circle K colour reference (measured from circlek.com CSS, derived noted):
 *   Brand red (action / brand / link)   #DA291C   measured brand red — THE Circle K red
 *   Brand red hover / active            #b8221a   darker red on hover (à confirmer)
 *   Orange accent (logo mark)           #F58220   Circle K orange accent (à confirmer, decorative)
 *   Near-black ink (text primary)       #1a1a1a   measured primary ink + reversed surface
 *   Secondary text                      #575855   measured secondary text
 *   Muted text                          #8a8a87   muted text (à confirmer)
 *   White (surface default)             #ffffff   surface default / raised / CTA text
 *   Subtle surface (page grey)          #f2f2f2   measured faint page grey
 *   Field border / divider              #e0e0e0   subtle border (à confirmer)
 *   Strong border                       #575855   measured strong border / secondary ink
 *   Success green                       #2e7d32   feedback success (à confirmer, AA on white)
 *   Warning amber                       #F58220   feedback warning (Circle K orange, à confirmer)
 *   Error red                           #DA291C   feedback error (brand red)
 *   Info blue                           #1169da   feedback info (à confirmer, AA-safe)
 */

// --- CIRCLE K raw colour palette (measured hex from circlek.com CSS) ---------
const circleKColor = {
  // The brand IS the Circle K red. Used for the brand mark, every primary CTA,
  // links and red accents. (measured brand red)
  red: {
    500: "#DA291C", // measured Circle K brand red — THE Circle K red
    600: "#b8221a", // darker red on hover/active (à confirmer)
    100: "#fbeae8" // faint red tint (derived for soft fills — à confirmer)
  },
  // Warm orange from the Circle K logo mark — a decorative accent.
  orange: {
    500: "#F58220" // Circle K orange accent (à confirmer, decorative)
  },
  // Neutral ink scale (Circle K body ink is a near-black, not pure black).
  ink: {
    default: "#1a1a1a", // measured primary ink
    secondary: "#575855", // measured secondary text
    muted: "#8a8a87" // muted text (à confirmer)
  },
  // Grey neutral scale (faint page greys + field/divider strokes).
  grey: {
    100: "#f2f2f2", // measured faint page grey
    200: "#e0e0e0" // subtle border / divider (à confirmer)
  },
  white: "#ffffff", // surface default / raised / CTA text
  // System / status colours (derived — Circle K publishes no status palette).
  system: {
    success: "#2e7d32", // feedback success (à confirmer, AA on white)
    warning: "#F58220", // feedback warning (Circle K orange, à confirmer)
    error: "#DA291C", // feedback error (brand red)
    info: "#1169da" // feedback info (à confirmer, AA-safe)
  }
} as const;

// --- foundation (CIRCLE K-specific values) ----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Circle K's PRIMARY
    // ACTION is RED, so the action steps are mapped to the red scale; the lightest
    // step is the faint red tint.
    blue: {
      10: circleKColor.red[100], // #fbeae8 faint red tint
      60: circleKColor.red[500], // #DA291C THE Circle K red (primary action)
      80: circleKColor.red[600] // #b8221a deep red (hover/active ground)
    },
    // Sentropic "cyan" accent slot. Circle K's warm accent is the logo orange;
    // mapped here so a distinct accent survives (à confirmer, decorative).
    cyan: {
      10: "#fef0e2", // faint orange tint (derived — à confirmer)
      50: circleKColor.orange[500], // #F58220 Circle K orange accent
      70: circleKColor.red[600] // #b8221a deep red
    },
    // Sentropic "slate" neutral family mapped onto the Circle K ink and grey ramp.
    slate: {
      0: circleKColor.white, // #ffffff white
      10: circleKColor.grey[100], // #f2f2f2 page grey
      20: circleKColor.grey[200], // #e0e0e0 divider / subtle border
      60: circleKColor.ink.secondary, // #575855 secondary text
      80: circleKColor.ink.default, // #1a1a1a primary ink
      90: circleKColor.ink.default // #1a1a1a strongest ink
    },
    feedback: {
      success: circleKColor.system.success,
      warning: circleKColor.system.warning,
      error: circleKColor.system.error,
      info: circleKColor.system.info
    }
  },
  // Circle K's site is a clean retail sans. The exact @font-face family is NOT
  // sourced; we reference a clean Helvetica Neue / Arial family by NAME only
  // (à confirmer). Mono is not part of Circle K — the Sentropic mono stack kept.
  font: {
    sans: "'Helvetica Neue', Arial, sans-serif",
    display: "'Helvetica Neue', Arial, sans-serif",
    mono: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Circle K spacing: a standard 4/8px-based ramp aligned to the Sentropic step
  // keys (exact paddings not separately tokenised — "à confirmer").
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
  // Circle K radii (à confirmer — not separately measured): mildly rounded retail
  // controls. md 4px for controls, lg 8px for cards, sm 2px for chips.
  radius: {
    none: "0",
    sm: "2px", // small chips (à confirmer)
    md: "4px", // controls / inputs (à confirmer)
    lg: "8px", // cards / larger surfaces (à confirmer)
    pill: "999px" // fully-rounded pill (tags / badges)
  },
  // Circle K elevation (à confirmer — mapped to the three Sentropic slots from a
  // standard light-surface elevation ramp).
  shadow: {
    subtle: "0 1px 3px rgb(0 0 0 / 0.12)",
    medium: "0 4px 8px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.16), 0 2px 4px rgb(0 0 0 / 0.10)"
  },
  // Circle K transitions (à confirmer — kept aligned with the base).
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Circle K-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (CIRCLE K) ---------------------------------------
  // Circle K field/divider strokes 1px solid #e0e0e0 (à confirmer); brand accent
  // borders 1px #DA291C. thick 2px kept for emphasis.
  borderWidth: {
    none: "0",
    thin: "1px", // input + divider stroke (à confirmer)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Circle K control density (à confirmer — a comfortable ~44px md control with
  // sm/lg brackets, standard retail sizing).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Circle K typography = the clean retail sans (Helvetica Neue / Arial, names
  // only, à confirmer). Base type 16px.
  typography: {
    control: { family: "'Helvetica Neue', Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.125", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Helvetica Neue', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Helvetica Neue', Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Circle K links: brand red, underline on hover (à confirmer).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // controls disabled at ≈ 40% (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // CIRCLE K FOCUS = a 2px RED OUTLINE in the brand red #DA291C (focus.strategy
  // "outline", 2px). The red brand drives the focus indicator on this retail UI.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: circleKColor.red[500], // #DA291C — brand red focus indicator
    inset: "0"
  },
  // CIRCLE K form fields are BOXED (outline): a white fill with a thin grey stroke
  // (1px solid #e0e0e0, à confirmer). `style: "outline"` makes the builder draw
  // four equal borders from `surface.default` + `border.subtle`. The native
  // <select> chevron is redrawn in the near-black ink with a 36px right gutter.
  field: {
    style: "outline",
    fillBg: circleKColor.white, // #ffffff
    underlineColor: circleKColor.grey[200], // #e0e0e0 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231a1a1a' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Circle K cards: white surface, mildly rounded (8px), a soft grey border and a
  // faint grey hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: circleKColor.grey[100] // #f2f2f2 faint grey hover
  },
  // Circle K secondary button = grey fill (measured action.secondary #f2f2f2),
  // near-black ink, slightly darker grey on hover.
  buttonSecondary: {
    background: circleKColor.grey[100], // #f2f2f2 grey secondary surface
    border: circleKColor.grey[200], // #e0e0e0 stroke
    hoverBackground: circleKColor.grey[200] // #e0e0e0 hover
  },
  // Circle K tabs / sub-nav: active tab = red bold label with a red bottom
  // indicator, transparent fill.
  tabs: {
    activeText: circleKColor.red[500], // #DA291C active label (brand red)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // red underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Circle K pagination: borderless link text; active page = filled red pill with
  // white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: circleKColor.red[500], // #DA291C link text (brand red)
    activeBackground: circleKColor.red[500], // #DA291C filled active page (brand red)
    activeText: circleKColor.white, // white on red
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Circle K breadcrumb: red links, grey trail, near-black current page, grey
  // separators.
  breadcrumb: {
    linkText: circleKColor.red[500], // #DA291C
    text: circleKColor.ink.secondary, // #575855 trail text
    currentText: circleKColor.ink.default, // #1a1a1a current page (ink)
    separator: circleKColor.ink.secondary, // #575855
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // Circle K notice / alert: a tinted box with a coloured left filet matching the
  // severity.
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
  // Circle K accordion / disclosure: a semibold near-black summary trigger,
  // mildly rounded, grey-separated.
  accordion: {
    text: circleKColor.ink.default, // #1a1a1a summary label (ink)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600", // summary triggers are semibold
    lineHeight: "1.5rem" // 24px
  },
  // Circle K tag: a small PILL chip with a faint grey fill and near-black ink.
  tag: {
    radius: "999px", // pill
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: circleKColor.grey[100], // #f2f2f2 faint grey fill
    neutralText: circleKColor.ink.default // #1a1a1a ink
  },
  // Circle K badge: a small filled badge — brand red fill / white text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: circleKColor.red[500], // #DA291C brand red
    infoText: circleKColor.white // white on red
  },
  // Circle K checkbox/radio label: regular near-black type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: circleKColor.ink.default // #1a1a1a ink
  },
  // Circle K search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Circle K toggle / switch label: regular near-black type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: circleKColor.ink.default // #1a1a1a ink
  }
} as const;

// --- semantic (CIRCLE K-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: circleKColor.white, // #ffffff white
    subtle: circleKColor.grey[100], // #f2f2f2 page grey
    raised: circleKColor.white, // #ffffff white
    inverse: circleKColor.ink.default, // #1a1a1a near-black reversed surface
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop
  },
  text: {
    primary: circleKColor.ink.default, // #1a1a1a measured primary ink
    secondary: circleKColor.ink.secondary, // #575855 measured secondary text
    muted: circleKColor.ink.muted, // #8a8a87 muted text (à confirmer)
    inverse: circleKColor.white, // white on dark/red surfaces
    link: circleKColor.red[500] // #DA291C link (brand red)
  },
  border: {
    subtle: circleKColor.grey[200], // #e0e0e0 divider / input stroke (à confirmer)
    strong: circleKColor.ink.secondary, // #575855 stronger border (measured)
    interactive: circleKColor.red[500] // #DA291C brand red (interactive accent)
  },
  action: {
    primary: circleKColor.red[500], // #DA291C THE Circle K red CTA
    primaryHover: circleKColor.red[600], // #b8221a red hover/active (à confirmer)
    primaryText: circleKColor.white, // white text on red
    secondary: circleKColor.grey[100], // #f2f2f2 grey secondary surface
    secondaryHover: circleKColor.grey[200], // #e0e0e0
    secondaryText: circleKColor.ink.default, // #1a1a1a near-black secondary label
    danger: circleKColor.red[500] // #DA291C danger (brand red)
  },
  feedback: {
    success: circleKColor.system.success, // #2e7d32 (à confirmer)
    warning: circleKColor.system.warning, // #F58220 orange (à confirmer)
    error: circleKColor.system.error, // #DA291C brand red
    info: circleKColor.system.info // #1169da (à confirmer)
  },
  status: {
    pending: circleKColor.system.warning, // #F58220
    processing: circleKColor.system.info, // #1169da
    completed: circleKColor.system.success, // #2e7d32
    failed: circleKColor.system.error // #DA291C
  },
  // Categorical data-vis palette. Circle K does not publish a categorical token
  // list; the eight categories below are ASSEMBLED from the measured brand hexes
  // (red lead, orange, ink, secondary ink, greys). See MAPPING.md "à confirmer".
  data: {
    category1: circleKColor.red[500], // #DA291C brand red
    category2: circleKColor.orange[500], // #F58220 orange accent
    category3: circleKColor.ink.default, // #1a1a1a near-black ink
    category4: circleKColor.ink.secondary, // #575855 secondary ink
    category5: circleKColor.red[600], // #b8221a deep red
    category6: circleKColor.ink.muted, // #8a8a87 muted grey
    category7: circleKColor.grey[200], // #e0e0e0 light grey
    category8: circleKColor.system.info // #1169da info blue
  }
} as const;

/**
 * The CIRCLE K theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Circle K-specific (red-on-white retail)
 * values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Circle K's red CTA, near-black
 * ink, boxed fields and red focus reach the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const circleKTheme: TenantTheme = {
  id: "circle-k",
  label: "Circle K",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default circleKTheme;
