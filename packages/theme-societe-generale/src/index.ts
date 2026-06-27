import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Société Générale brand theme for the Sentropic token structure.
 *
 * All values below are anchored on Société Générale's PUBLIC brand identity:
 * the 2023 "SG" rebrand — a SQUARED red-over-black mark divided by a white bar.
 * The signature colours are the official "Rouge SG" (Torch Red #e9041e) and SG
 * black (#000000). We reference font *names* only — no binaries. Sources are
 * documented in MAPPING.md. SG does not publish a full public CSS token tree
 * for greys/semantic roles, so the neutral scale and the success/warning/info
 * hues are DERIVED for WCAG AA on white and flagged "à confirmer" in MAPPING.md.
 *
 * Société Générale colour reference (light):
 *   White (background default)        #ffffff
 *   Grey light (background alt)        #f5f5f5   (derived)
 *   Card hover tint                    #ededed   (derived)
 *   Grey border subtle                 #e0e0e0   (derived)
 *   Grey border strong                 #c2c2c2   (derived)
 *   Grey text muted                    #6e6e6e   (derived)
 *   Grey secondary text                #3a3a3a   (derived)
 *   Black (text primary / inverse)     #000000   (SG black, lower half of the square)
 *   Rouge SG (brand primary)           #e9041e   (official "Rouge SG" / Torch Red)
 *   Rouge SG hover                     #c20318   (derived darker interactive red)
 *   Error red (AA on white)            #cc0a1e   (derived darker SG red)
 */

// --- Société Générale raw colour palette -----------------------------------
const sgColor = {
  // Rouge SG — the signature brand / action family.
  red: {
    primary: "#e9041e", // official "Rouge SG" / Torch Red (the canonical brand colour)
    hover: "#c20318", // derived darker interactive red (à confirmer)
    error: "#cc0a1e", // derived darker SG red for WCAG AA text on white (à confirmer)
    tint: "#fde6e8" // derived light red tint (à confirmer)
  },
  // SG black — the lower half of the square; primary text and inverse surface.
  black: "#000000", // SG black
  // Neutral grey scale (derived to read clean on white; à confirmer).
  grey: {
    0: "#ffffff",
    50: "#f5f5f5", // background alt / secondary surface (derived)
    100: "#ededed", // card hover / secondary hover tint (derived)
    200: "#e0e0e0", // subtle border (derived)
    400: "#c2c2c2", // strong border / field underline (derived)
    500: "#6e6e6e", // muted text (derived)
    700: "#3a3a3a", // secondary text (derived)
    900: "#000000" // primary text (SG black)
  },
  // SG has no cyan; a derived blue accent fills the Sentropic cyan slot (à confirmer).
  blue: {
    tint: "#e3eef7", // light blue tint (derived — à confirmer)
    accent: "#1264a3", // derived blue accent (à confirmer)
    dark: "#0d4c7d" // darker blue (derived — à confirmer)
  },
  // System / status colours. SG publishes the brand red; success/warning/info
  // are derived for WCAG AA on white (no public SG token — à confirmer).
  system: {
    success: "#1f7a3d", // derived AA-safe green (à confirmer)
    warning: "#b25e00", // derived AA-safe amber (à confirmer)
    error: "#cc0a1e", // derived darker SG red for AA text (à confirmer)
    info: "#1264a3" // derived informational blue (à confirmer)
  },
  // Decorative / data-vis hues — coherent proposal anchored on SG red/black
  // (SG publishes no 8-colour sequential scale — à confirmer).
  data: {
    red: "#e9041e",
    black: "#000000",
    blue: "#1264a3",
    amber: "#b25e00",
    green: "#1f7a3d",
    purple: "#7a3a8c",
    pink: "#d2569e",
    grey: "#6e6e6e"
  },
  // Focus ring colour (SG red, high-contrast outline).
  focus: "#e9041e"
} as const;

// --- foundation (Société Générale-specific values) -------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family carries the SG red (brand action family).
    blue: {
      10: sgColor.red.tint, // #fde6e8 lightest red tint
      60: sgColor.red.primary, // #e9041e Rouge SG (primary)
      80: sgColor.red.hover // #c20318 interactive red
    },
    // SG has no cyan; the closest accent is a derived blue (à confirmer).
    cyan: {
      10: sgColor.blue.tint, // #e3eef7 light blue tint (derived — à confirmer)
      50: sgColor.blue.accent, // #1264a3 derived blue accent (à confirmer)
      70: sgColor.blue.dark // #0d4c7d darker blue (derived — à confirmer)
    },
    // Sentropic "slate" role family mapped onto the SG neutral grey scale.
    slate: {
      0: sgColor.grey[0], // white
      10: sgColor.grey[50], // #f5f5f5 background alt
      20: sgColor.grey[200], // #e0e0e0 subtle borders
      60: sgColor.grey[700], // #3a3a3a secondary text
      80: sgColor.grey[900], // #000000 primary text (SG black)
      90: sgColor.black // #000000 darkest (SG black)
    },
    feedback: {
      success: sgColor.system.success,
      warning: sgColor.system.warning,
      error: sgColor.system.error,
      info: sgColor.system.info
    }
  },
  // SG's wordmark is a grotesque ("Media Gothic"); no public webfont name is
  // confirmed, so a neutral grotesque stack is used for sans + display (à
  // confirmer). No SG mono face exists, so the Sentropic mono stack is kept.
  // Font *names* only — no binaries.
  font: {
    sans: "'Helvetica Neue', Helvetica, Arial, system-ui, -apple-system, 'Segoe UI', sans-serif",
    display: "'Helvetica Neue', Helvetica, Arial, system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; SG's public scale is not individually tokenised).
  spacing: {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    6: "1.5rem",
    8: "2rem",
    12: "3rem",
    16: "4rem"
  },
  // SG is a SQUARE brand: radii are SHARP — fields and buttons fully square
  // (0px), cards barely softened (~2px). This sharpness is the SG signature
  // versus rounded banks. Pills stay fully rounded. (SG radii are not published
  // publicly — measured visually on the squared identity, à confirmer.)
  radius: {
    none: "0",
    sm: "0", // 0px — fields sharp
    md: "0", // 0px — sharp buttons
    lg: "0.125rem", // 2px — cards barely softened
    pill: "999px"
  },
  // Light neutral elevation on cards. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.10)",
    medium: "0 4px 12px rgb(0 0 0 / 0.14)",
    floating: "0 8px 24px rgb(0 0 0 / 0.18)"
  },
  // Durations not strongly tokenised publicly; kept aligned with base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Société Générale) -------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // SG control density — clean, mid-height controls (md ≈ 44px field height,
  // lg ≈ 52px CTA). Metrics "à confirmer".
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "0.875rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.0625rem" }
  },
  // SG typography: a neutral grotesque across the board (à confirmer). Control
  // labels are semibold.
  typography: {
    control: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Helvetica Neue', Helvetica, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // SG links are the brand red, underlined.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "0.08em", decorationOffset: "0.15em",
      textDecorationHover: "underline", decorationThicknessHover: "0.12em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.5",
  transition: { property: "background-color, border-color, color, outline-color", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // SG FOCUS = a high-contrast SG-red OUTLINE offset from the control.
  // (Outline technique measured visually on SG web properties — à confirmer width/offset.)
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: sgColor.focus, // #e9041e SG red ring
    inset: "0"
  },
  // SG form fields are BOXED (outline): white fill, 1px grey border, SHARP (0px
  // radius). Native <select> chevron redrawn in SG red.
  field: {
    style: "outline",
    fillBg: sgColor.grey[0], // #ffffff
    underlineColor: sgColor.grey[400], // #c2c2c2
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in SG red.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23e9041e' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // SG cards: nearly square (2px via radius.lg) with a 1px subtle grey border
  // and a light grey hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: sgColor.grey[100] // #ededed
  },
  // SG secondary button = a light-grey ghost: transparent fill, grey stroke,
  // black label, light grey hover fill (à confirmer).
  buttonSecondary: {
    background: "transparent",
    border: sgColor.grey[400], // #c2c2c2 grey stroke
    hoverBackground: sgColor.grey[100] // #ededed light grey hover
  },
  // SG tabs: active tab = bold SG-red label with a bottom red underline.
  tabs: {
    activeText: sgColor.red.primary, // #e9041e
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    fontSize: "1rem",
    lineHeight: "1.5rem",
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // SG pagination: borderless red links; active page = filled SG red.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: sgColor.red.primary, // #e9041e
    activeBackground: sgColor.red.primary, // #e9041e filled active
    activeText: sgColor.grey[0], // white
    activeBorderWidth: "0",
    paddingBlock: "0.25rem",
    paddingInline: "0.75rem",
    minSize: "2.25rem",
    fontSize: "1rem",
    lineHeight: "1.5rem"
  },
  // SG breadcrumb: red links, black current page, grey separators.
  breadcrumb: {
    linkText: sgColor.red.primary, // #e9041e
    text: sgColor.grey[700], // #3a3a3a
    currentText: sgColor.grey[900], // #000000
    separator: sgColor.grey[400], // #c2c2c2
    fontSize: "0.875rem",
    lineHeight: "1.5rem",
    currentWeight: "700"
  },
  // SG notice / alert: a coloured LEFT accent filet on a transparent box.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem",
    paddingTop: "1rem",
    paddingRight: "1rem",
    paddingBottom: "1rem",
    paddingLeft: "1.25rem",
    fontSize: "1rem",
    lineHeight: "1.5rem"
  },
  // SG accordion: an SG-red bold summary trigger.
  accordion: {
    text: sgColor.red.primary, // #e9041e
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    fontSize: "1rem",
    fontWeight: "600",
    lineHeight: "1.5rem"
  },
  // SG tag: a small SHARP grey chip (square corners to match the SG square brand).
  tag: {
    radius: "0",
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    lineHeight: "1.5rem",
    minHeight: "1.5rem",
    neutralBackground: sgColor.grey[100], // #ededed
    neutralText: sgColor.grey[900] // #000000
  },
  // SG badge: a small SHARP filled badge in brand red.
  badge: {
    radius: "0",
    paddingBlock: "0",
    paddingInline: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "700",
    lineHeight: "1.5rem",
    textTransform: "none",
    minHeight: "1.5rem",
    infoBackground: sgColor.red.primary, // #e9041e
    infoText: sgColor.grey[0] // white
  },
  choice: {
    labelFontSize: "1rem",
    labelLineHeight: "1.5rem",
    radioLineHeight: "1.5rem",
    labelColor: sgColor.grey[900] // #000000
  },
  search: {
    paddingBlock: "0.5rem",
    paddingInline: "1rem",
    fontSize: "1rem",
    lineHeight: "1.5rem"
  },
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem",
    textColor: sgColor.grey[900] // #000000
  }
} as const;

// --- semantic (Société Générale-specific role mapping) ---------------------
const semantic = {
  surface: {
    default: sgColor.grey[0], // white
    subtle: sgColor.grey[50], // #f5f5f5 background alt
    raised: sgColor.grey[0], // white
    inverse: sgColor.black, // #000000 SG-black inverse surface
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop (SG black tint)
  },
  text: {
    primary: sgColor.grey[900], // #000000 SG black
    secondary: sgColor.grey[700], // #3a3a3a
    muted: sgColor.grey[500], // #6e6e6e
    inverse: sgColor.grey[0], // white on dark / coloured surfaces
    link: sgColor.red.primary // #e9041e SG red links
  },
  border: {
    subtle: sgColor.grey[200], // #e0e0e0
    strong: sgColor.grey[400], // #c2c2c2
    interactive: sgColor.red.primary // #e9041e
  },
  action: {
    primary: sgColor.red.primary, // #e9041e Rouge SG
    primaryHover: sgColor.red.hover, // #c20318
    primaryText: sgColor.grey[0], // white
    secondary: sgColor.grey[50], // #f5f5f5 light-grey secondary surface
    secondaryHover: sgColor.grey[100], // #ededed
    secondaryText: sgColor.black, // #000000
    danger: sgColor.red.primary // #e9041e Rouge SG
  },
  feedback: {
    success: sgColor.system.success, // #1f7a3d
    warning: sgColor.system.warning, // #b25e00
    error: sgColor.system.error, // #cc0a1e
    info: sgColor.system.info // #1264a3
  },
  status: {
    pending: sgColor.system.warning,
    processing: sgColor.system.info,
    completed: sgColor.system.success,
    failed: sgColor.system.error
  },
  // Categorical data-vis palette anchored on SG red/black (à confirmer).
  data: {
    category1: sgColor.data.red, // #e9041e
    category2: sgColor.data.black, // #000000
    category3: sgColor.data.blue, // #1264a3
    category4: sgColor.data.amber, // #b25e00
    category5: sgColor.data.green, // #1f7a3d
    category6: sgColor.data.purple, // #7a3a8c
    category7: sgColor.data.pink, // #d2569e
    category8: sgColor.data.grey // #6e6e6e
  }
} as const;

/**
 * The Société Générale theme as a Sentropic `TenantTheme`. The `component`
 * layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent`.
 */
export const societeGeneraleTheme: TenantTheme = {
  id: "societe-generale",
  label: "Société Générale",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default societeGeneraleTheme;
