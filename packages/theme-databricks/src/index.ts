import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Databricks theme for the Sentropic token structure.
 *
 * All values below are taken from Databricks' PUBLIC brand system (the
 * "Lava / Navy / Oat" primary palette published in the Databricks brand &
 * extended brand guidelines) and the DM Sans brand typeface. We only reference
 * the font *names* here (DM Sans / DM Mono), never the font binaries. Sources
 * are documented in MAPPING.md. Where Databricks publishes no direct public
 * equivalent for a Sentropic role (intermediate greys, navy mid-tones, the
 * feedback/system colours, the data-vis scale), the closest brand token is
 * derived and the choice is flagged "à confirmer" in MAPPING.md.
 *
 * Databricks colour reference (light theme):
 *   Lava 600 (primary brand / action)   #ff3621   (measured)
 *   Navy 800 (dark surface / text)       #1b3139   (measured)
 *   Oat Light (warm background)          #f4f0e7   (measured)
 *   Oat Medium (warm border / divider)   #dbd7ce   (measured)
 *   White (surface default)              #ffffff   (measured)
 *   Lava hover (darker)                  #e62d18   (derived — à confirmer)
 *   Lava light tint                      #ffe7e2   (derived — à confirmer)
 *   Deep red (danger / error)            #c42b1c   (derived — à confirmer)
 *   Navy mid (strong text)               #2e4148   (derived — à confirmer)
 *   Navy-grey (secondary text)           #5b6b71   (derived — à confirmer)
 *   Muted grey (placeholder)             #8a9499   (derived — à confirmer)
 *   Teal accent                          #1b7f93   (derived — à confirmer)
 *
 * Databricks leads with bold "Lava" red-orange pops on warm Oat / Navy / white
 * grounds. The brand has no published cyan; the Sentropic "cyan" accent slot is
 * filled with a Databricks teal (documented "à confirmer" in MAPPING.md).
 */

// --- Databricks raw colour palette (public brand) --------------------------
const databricksColor = {
  // "Lava" — the Databricks signature red-orange / brand+action family.
  lava: {
    primary: "#ff3621", // Lava 600 — primary brand / action (measured)
    hover: "#e62d18", // darker Lava for hover/active (derived — à confirmer)
    deep: "#c42b1c", // deeper red for destructive/error text (derived — à confirmer)
    10: "#ffe7e2" // light Lava tint / selected fill (derived — à confirmer)
  },
  // "Navy" — the dark teal-navy ground / text family.
  navy: {
    800: "#1b3139", // Navy 800 — darkest surface / primary text (measured)
    600: "#2e4148", // navy mid — strong text / dark hover (derived — à confirmer)
    400: "#5b6b71" // navy-grey — secondary text / icons (derived — à confirmer)
  },
  // "Oat" — the warm cream neutral family (a Databricks signature).
  oat: {
    light: "#f4f0e7", // Oat Light — warm background alt (measured)
    medium: "#dbd7ce", // Oat Medium — warm border / divider (measured)
    strong: "#b9b3a6" // stronger warm border (derived — à confirmer)
  },
  // Teal accent — the Sentropic "cyan" slot (Databricks has no published cyan).
  teal: {
    main: "#1b7f93", // Databricks teal accent (derived — à confirmer)
    light: "#e3f1f4", // light teal tint (derived — à confirmer)
    dark: "#11586a" // darker teal (derived — à confirmer)
  },
  // Neutral greys (placeholder / muted) derived around the navy/oat grounds.
  grey: {
    0: "#ffffff", // white (measured)
    muted: "#8a9499" // placeholder / muted text (derived — à confirmer)
  },
  // System / status colours (no published Databricks set — derived, AA on white).
  system: {
    success: "#2f8a4e", // green (derived — à confirmer, AA on white)
    error: "#c42b1c", // deep red (derived — à confirmer)
    warning: "#b4540a", // amber/orange (derived — à confirmer, AA on white)
    info: "#1b7f93" // teal (derived — à confirmer)
  }
} as const;

// --- foundation (Databricks-specific values) -------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto Databricks Lava (the primary /
    // action family — Databricks leads with red-orange, not blue).
    blue: {
      10: databricksColor.lava[10], // light Lava tint (à confirmer)
      60: databricksColor.lava.primary, // Lava 600 (primary)
      80: databricksColor.lava.hover // darker Lava (à confirmer)
    },
    // Databricks has no cyan; the secondary accent slot maps to a Databricks teal.
    cyan: {
      10: databricksColor.teal.light, // light teal tint (à confirmer)
      50: databricksColor.teal.main, // teal accent (à confirmer)
      70: databricksColor.teal.dark // darker teal (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the Navy + Oat neutral grounds.
    slate: {
      0: databricksColor.grey[0], // white (measured)
      10: databricksColor.oat.light, // Oat Light — warm background (measured)
      20: databricksColor.oat.medium, // Oat Medium — warm border (measured)
      60: databricksColor.navy[400], // navy-grey secondary text (à confirmer)
      80: databricksColor.navy[600], // navy mid strong text (à confirmer)
      90: databricksColor.navy[800] // Navy 800 — darkest (measured)
    },
    feedback: {
      success: databricksColor.system.success,
      warning: databricksColor.system.warning,
      error: databricksColor.system.error,
      info: databricksColor.system.info
    }
  },
  // Databricks ships DM Sans as the brand typeface (headings + body). DM Mono is
  // the companion monospace. Font *names* only, never binaries.
  font: {
    sans: "'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'DM Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard 4px-based rem spacing scale (aligned with the Sentropic base for
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
  // Databricks product UI is crisp / lightly rounded: small control radii, cards
  // a touch larger. Exact radii not published — à confirmer.
  radius: {
    none: "0",
    sm: "0.125rem", // 2px
    md: "0.25rem", // 4px — button / input / tabs (à confirmer)
    lg: "0.5rem", // 8px — cards (à confirmer)
    pill: "999px" // chips / pills
  },
  // Neutral, low-opacity shadows tinted toward Navy. Exact specs à confirmer.
  shadow: {
    subtle: "0 1px 2px rgb(27 49 57 / 0.10)",
    medium: "0 2px 6px rgb(27 49 57 / 0.12), 0 1px 2px rgb(27 49 57 / 0.08)",
    floating: "0 8px 24px rgb(27 49 57 / 0.16), 0 2px 6px rgb(27 49 57 / 0.10)"
  },
  // Motion kept aligned with the Sentropic base; exact specs à confirmer.
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Databricks-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Databricks) -------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Enterprise control density: md ≈ 40px target, sm 32px, lg 48px. À confirmer.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.0625rem" }
  },
  // Databricks typography: DM Sans for interactive/labels (medium 500) and
  // body/fields (regular 400).
  typography: {
    control: { family: "'DM Sans', system-ui, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'DM Sans', system-ui, sans-serif", size: "0.9375rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'DM Sans', system-ui, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Databricks links read as Lava red-orange text; underline appears on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // à confirmer
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // Databricks FOCUS = a 2px outline in Navy (kept distinct from the Lava brand
  // red so focus never reads as an error state). Exact technique à confirmer.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: databricksColor.navy[800], // #1b3139 navy focus
    inset: "0"
  },
  // Databricks form fields are BOXED & lightly rounded (outline): white fill, a
  // 1px warm-grey border and the small control radius. `style: "outline"` draws
  // four equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: databricksColor.grey[0], // #ffffff
    underlineColor: databricksColor.oat.medium, // #dbd7ce (unused for outline)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Navy with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231b3139' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Databricks card: a 1px warm border + small radius, subtle warm hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: databricksColor.oat.light // #f4f0e7
  },
  // Secondary button: a Navy-outlined button (transparent fill, navy stroke +
  // text, warm Oat-light state-layer fill on hover). À confirmer.
  buttonSecondary: {
    background: "transparent",
    border: databricksColor.navy[800], // #1b3139 stroke
    hoverBackground: databricksColor.oat.light // #f4f0e7 light fill on hover
  },
  // Databricks tabs: active tab = Lava label with a 2px bottom indicator.
  tabs: {
    activeText: databricksColor.lava.primary, // #ff3621
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // indicator on the bottom edge
    indicatorMode: "border" // a real 2px bottom border
  },
  // Pagination: borderless navy links; active page = filled Navy. À confirmer.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: databricksColor.navy[800], // #1b3139 link text
    activeBackground: databricksColor.navy[800], // #1b3139 filled active page
    activeText: databricksColor.grey[0], // white on navy
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Breadcrumb: navy trail, Lava links, warm-grey separators. À confirmer.
  breadcrumb: {
    linkText: databricksColor.lava.primary, // #ff3621
    text: databricksColor.navy[400], // #5b6b71 trail text
    currentText: databricksColor.navy[800], // #1b3139 current page
    separator: databricksColor.oat.strong, // #b9b3a6
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "500"
  },
  // Banner / notice: a coloured LEFT accent filet on a transparent box. À confirmer.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem",
    paddingRight: "1rem",
    paddingBottom: "1rem",
    paddingLeft: "1.25rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem"
  },
  // Expansion panel: a navy medium summary trigger. À confirmer.
  accordion: {
    text: databricksColor.navy[800], // #1b3139 summary label
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    fontSize: "0.9375rem",
    fontWeight: "500",
    lineHeight: "1.25rem"
  },
  // Chip / tag: a warm-grey rounded chip. À confirmer.
  tag: {
    radius: "0.25rem", // 4px (crisp Databricks rounding)
    paddingBlock: "0.25rem",
    paddingInline: "0.75rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    lineHeight: "1.25rem",
    minHeight: "1.75rem",
    neutralBackground: databricksColor.oat.light, // #f4f0e7
    neutralText: databricksColor.navy[800] // #1b3139
  },
  // Badge: a small filled badge. À confirmer.
  badge: {
    radius: "0.25rem", // 4px
    paddingBlock: "0",
    paddingInline: "0.5rem",
    fontSize: "0.75rem",
    fontWeight: "500",
    lineHeight: "1rem",
    textTransform: "none",
    minHeight: "1rem",
    infoBackground: databricksColor.lava.primary, // #ff3621
    infoText: databricksColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "0.9375rem",
    labelLineHeight: "1.25rem",
    radioLineHeight: "1.25rem",
    labelColor: databricksColor.navy[800] // #1b3139
  },
  // Search input.
  search: {
    paddingBlock: "0.5rem",
    paddingInline: "1rem",
    fontSize: "0.9375rem",
    lineHeight: "1.5rem"
  },
  // Toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem",
    textColor: databricksColor.navy[800] // #1b3139
  }
} as const;

// --- semantic (Databricks role mapping) ------------------------------------
const semantic = {
  surface: {
    default: databricksColor.grey[0], // white (measured)
    subtle: databricksColor.oat.light, // #f4f0e7 Oat Light warm background (measured)
    raised: databricksColor.grey[0], // white
    inverse: databricksColor.navy[800], // #1b3139 Navy dark surface (measured)
    overlay: "rgb(27 49 57 / 0.6)" // modal backdrop (Navy tint)
  },
  text: {
    primary: databricksColor.navy[800], // #1b3139 Navy primary text (measured)
    secondary: databricksColor.navy[400], // #5b6b71 secondary text (à confirmer)
    muted: databricksColor.grey.muted, // #8a9499 placeholder (à confirmer)
    inverse: databricksColor.grey[0], // white on dark / coloured surfaces
    link: databricksColor.lava.primary // #ff3621 Lava link
  },
  border: {
    subtle: databricksColor.oat.medium, // #dbd7ce Oat Medium warm border (measured)
    strong: databricksColor.oat.strong, // #b9b3a6 stronger warm border (à confirmer)
    interactive: databricksColor.lava.primary // #ff3621 interactive
  },
  action: {
    primary: databricksColor.lava.primary, // #ff3621 Lava primary button (measured)
    primaryHover: databricksColor.lava.hover, // #e62d18 darker Lava (à confirmer)
    primaryText: databricksColor.grey[0], // white text on Lava
    secondary: databricksColor.oat.light, // #f4f0e7 warm secondary surface
    secondaryHover: databricksColor.oat.medium, // #dbd7ce
    secondaryText: databricksColor.navy[800], // #1b3139
    danger: databricksColor.system.error // #c42b1c (à confirmer)
  },
  feedback: {
    success: databricksColor.system.success,
    warning: databricksColor.system.warning,
    error: databricksColor.system.error,
    info: databricksColor.system.info
  },
  status: {
    pending: databricksColor.system.warning,
    processing: databricksColor.system.info,
    completed: databricksColor.system.success,
    failed: databricksColor.system.error
  },
  // Categorical data-vis palette built from the Databricks Lava / Navy / Oat
  // brand plus a teal accent. Databricks publishes no 8-colour sequential
  // data-vis scale, so this is a coherent proposal (see MAPPING.md, "à confirmer").
  data: {
    category1: databricksColor.lava.primary, // Lava 600
    category2: databricksColor.navy[800], // Navy 800
    category3: databricksColor.teal.main, // teal accent
    category4: databricksColor.system.success, // green
    category5: databricksColor.oat.medium, // Oat Medium
    category6: databricksColor.system.warning, // amber
    category7: databricksColor.navy[400], // navy-grey
    category8: databricksColor.grey.muted // muted grey
  }
} as const;

/**
 * The Databricks theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Databricks-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Databricks brand reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const databricksTheme: TenantTheme = {
  id: "databricks",
  label: "Databricks",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default databricksTheme;
