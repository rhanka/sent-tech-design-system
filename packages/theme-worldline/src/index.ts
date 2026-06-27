import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Worldline brand theme for the Sentropic token structure.
 *
 * Worldline is a European payments / fintech group; its public brand identity is
 * anchored on a single deep institutional BLUE ("Worldline Blue" #0066A1) on a
 * predominantly white surface with a documented light grey (#e6e6e6). Only the
 * brand blue and that light grey are publicly documented (worldline.com, brand
 * colour references); Worldline does not publish a full public CSS token tree,
 * and it has NO public brand red. The neutral scale, the semantic hues
 * (including the derived danger red), the corporate font stack, the radii and
 * the focus metrics are therefore DERIVED (WCAG AA on white where relevant) and
 * flagged "à confirmer" in MAPPING.md. We reference font *names* only — no
 * binaries are shipped.
 *
 * Worldline colour reference (light):
 *   White (background default)        #ffffff
 *   Grey light (background alt)       #f4f7f9   (derived)
 *   Grey card hover                   #ececec   (derived)
 *   Grey border subtle                #e6e6e6   (OFFICIAL Worldline light grey)
 *   Grey border strong                #c2c8cd   (derived)
 *   Grey text muted                   #5f6b73   (derived)
 *   Grey secondary text               #2f3a42   (derived)
 *   Dark navy text primary            #0c2233   (derived)
 *   Worldline Blue (brand primary)    #0066a1   (official Worldline Blue)
 *   Worldline Blue interactive hover  #00517f   (derived darker blue)
 *   Worldline Blue dark (inverse)     #003a5c   (derived darker blue)
 *   Danger red (AA on white)          #cc1a2b   (derived — Worldline has no brand red)
 */

// --- Worldline raw colour palette ------------------------------------------
const worldlineColor = {
  // Worldline Blue — the deep institutional brand / action family.
  blue: {
    primary: "#0066a1", // official Worldline Blue (the canonical brand colour)
    hover: "#00517f", // derived darker interactive blue (à confirmer)
    dark: "#003a5c", // derived darker blue — inverse surface (à confirmer)
    tint: "#e5eff5", // derived light blue tint (à confirmer)
    tintHover: "#d4e6f0", // derived light blue hover (à confirmer)
    info: "#0066a1" // brand blue reused for informational state
  },
  // Worldline has NO public brand red — danger / error are derived (à confirmer).
  red: {
    accent: "#cc1a2b", // derived danger red (à confirmer)
    error: "#cc1a2b" // derived error red, AA text on white (à confirmer)
  },
  // Neutral grey scale (derived to harmonise with the Worldline blue; the 200
  // step is the OFFICIAL Worldline light grey, the rest à confirmer).
  grey: {
    0: "#ffffff",
    50: "#f4f7f9", // background alt (derived)
    100: "#ececec", // card hover tint (derived)
    200: "#e6e6e6", // subtle border (OFFICIAL Worldline light grey)
    400: "#c2c8cd", // strong border / input border (derived)
    500: "#5f6b73", // muted text (derived)
    700: "#2f3a42", // secondary text (derived)
    900: "#0c2233" // primary text, dark navy (derived)
  },
  // System / status colours. Worldline publishes no public semantic tokens, so
  // success/warning/error are derived for WCAG AA on white; info reuses the
  // brand blue (à confirmer).
  system: {
    success: "#1f7a3d", // derived AA-safe green (à confirmer)
    warning: "#b25e00", // derived AA-safe amber (à confirmer)
    error: "#cc1a2b", // derived danger red for AA text (à confirmer)
    info: "#0066a1" // brand blue (informational)
  },
  // Decorative / data-vis hues — coherent proposal anchored on the Worldline
  // blue (Worldline publishes no 8-colour sequential scale — à confirmer).
  data: {
    blue: "#0066a1",
    cyan: "#1f9bd1",
    teal: "#00a3a3",
    gold: "#f5a623",
    green: "#1f7a3d",
    purple: "#7a3a8c",
    pink: "#d2569e",
    slate: "#2f3a42"
  },
  // Focus ring colour (Worldline blue, high-contrast outline).
  focus: "#0066a1"
} as const;

// --- foundation (Worldline-specific values) --------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family carries the Worldline blue (brand action family).
    blue: {
      10: worldlineColor.blue.tint, // #e5eff5 lightest blue tint
      60: worldlineColor.blue.primary, // #0066a1 Worldline Blue (primary)
      80: worldlineColor.blue.hover // #00517f interactive blue
    },
    // Worldline has no second brand hue; a brighter derived blue fills the
    // Sentropic cyan slot (à confirmer).
    cyan: {
      10: "#e3f3fb", // light blue tint (derived — à confirmer)
      50: worldlineColor.data.cyan, // #1f9bd1 brighter derived blue (à confirmer)
      70: "#0a6e96" // darker derived blue (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the Worldline neutral grey scale.
    slate: {
      0: worldlineColor.grey[0], // white
      10: worldlineColor.grey[50], // #f4f7f9 background alt
      20: worldlineColor.grey[200], // #e6e6e6 subtle borders (official light grey)
      60: worldlineColor.grey[700], // #2f3a42 secondary text
      80: worldlineColor.grey[900], // #0c2233 primary text
      90: worldlineColor.blue.dark // #003a5c darkest (Worldline dark blue)
    },
    feedback: {
      success: worldlineColor.system.success,
      warning: worldlineColor.system.warning,
      error: worldlineColor.system.error,
      info: worldlineColor.system.info
    }
  },
  // Worldline uses a custom corporate sans with no confirmed public webfont name,
  // so a neutral system-ui sans stack is used for body, interactive and display
  // (à confirmer); the Sentropic mono stack is kept. Font *names* only — no binaries.
  font: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
    display: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; Worldline's public scale is not individually tokenised).
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
  // Worldline aesthetic is CLEAN fintech with MODERATE rounding: fields ~3px,
  // buttons ~6px, cards ~12px. Pills stay fully rounded.
  // (Worldline radii are not published publicly — measured visually, à confirmer.)
  radius: {
    none: "0",
    sm: "0.1875rem", // 3px — fields
    md: "0.375rem", // 6px — buttons / CTAs
    lg: "0.75rem", // 12px — cards / containers
    pill: "999px"
  },
  // Light neutral elevation on cards. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(12 34 51 / 0.10)",
    medium: "0 4px 12px rgb(12 34 51 / 0.14)",
    floating: "0 8px 24px rgb(12 34 51 / 0.18)"
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
  // --- Anatomy primitives (Worldline) --------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Worldline control density — clean, mid-height controls (md ≈ 44px field
  // height, lg ≈ 52px CTA). Metrics "à confirmer".
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "0.875rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.0625rem" }
  },
  // Worldline typography: a neutral system-ui sans across the board. Control
  // labels are semibold. (Worldline corporate font name is not public — à confirmer.)
  typography: {
    control: { family: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Worldline links are the brand blue, underlined.
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
  // Worldline FOCUS = a high-contrast Worldline-blue OUTLINE offset from the control.
  // (Outline technique measured visually — à confirmer width/offset.)
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: worldlineColor.focus, // #0066a1 Worldline blue ring
    inset: "0"
  },
  // Worldline form fields are BOXED (outline): white fill, 1px grey border, ~3px radius.
  field: {
    style: "outline",
    fillBg: worldlineColor.grey[0], // #ffffff
    underlineColor: worldlineColor.grey[400], // #c2c8cd
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Worldline blue.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230066a1' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Worldline cards: moderately rounded with a 1px subtle grey border and light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: worldlineColor.grey[100] // #ececec
  },
  // Worldline secondary button = white/ghost with Worldline-blue text and a light blue hover.
  buttonSecondary: {
    background: "transparent",
    border: worldlineColor.blue.primary, // #0066a1 blue stroke
    hoverBackground: worldlineColor.blue.tintHover // #d4e6f0 light blue hover
  },
  // Worldline tabs: active tab = bold Worldline-blue label with a bottom blue underline.
  tabs: {
    activeText: worldlineColor.blue.primary, // #0066a1
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
  // Worldline pagination: borderless blue links; active page = filled Worldline blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: worldlineColor.blue.primary, // #0066a1
    activeBackground: worldlineColor.blue.primary, // #0066a1 filled active
    activeText: worldlineColor.grey[0], // white
    activeBorderWidth: "0",
    paddingBlock: "0.25rem",
    paddingInline: "0.75rem",
    minSize: "2.25rem",
    fontSize: "1rem",
    lineHeight: "1.5rem"
  },
  // Worldline breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: worldlineColor.blue.primary, // #0066a1
    text: worldlineColor.grey[700], // #2f3a42
    currentText: worldlineColor.grey[900], // #0c2233
    separator: worldlineColor.grey[400], // #c2c8cd
    fontSize: "0.875rem",
    lineHeight: "1.5rem",
    currentWeight: "700"
  },
  // Worldline notice / alert: a coloured LEFT accent filet on a transparent box.
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
  // Worldline accordion: a Worldline-blue bold summary trigger.
  accordion: {
    text: worldlineColor.blue.primary, // #0066a1
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    fontSize: "1rem",
    fontWeight: "600",
    lineHeight: "1.5rem"
  },
  // Worldline tag: a small rounded grey chip.
  tag: {
    radius: "6px",
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    lineHeight: "1.5rem",
    minHeight: "1.5rem",
    neutralBackground: worldlineColor.grey[100], // #ececec
    neutralText: worldlineColor.grey[900] // #0c2233
  },
  // Worldline badge: a small filled badge in brand blue.
  badge: {
    radius: "6px",
    paddingBlock: "0",
    paddingInline: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "700",
    lineHeight: "1.5rem",
    textTransform: "none",
    minHeight: "1.5rem",
    infoBackground: worldlineColor.blue.primary, // #0066a1
    infoText: worldlineColor.grey[0] // white
  },
  choice: {
    labelFontSize: "1rem",
    labelLineHeight: "1.5rem",
    radioLineHeight: "1.5rem",
    labelColor: worldlineColor.grey[900] // #0c2233
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
    textColor: worldlineColor.grey[900] // #0c2233
  }
} as const;

// --- semantic (Worldline-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: worldlineColor.grey[0], // white
    subtle: worldlineColor.grey[50], // #f4f7f9 background alt
    raised: worldlineColor.grey[0], // white
    inverse: worldlineColor.blue.dark, // #003a5c Worldline dark-blue inverse surface
    overlay: "rgb(0 58 92 / 0.6)" // modal backdrop (Worldline dark-blue tint)
  },
  text: {
    primary: worldlineColor.grey[900], // #0c2233 dark navy
    secondary: worldlineColor.grey[700], // #2f3a42
    muted: worldlineColor.grey[500], // #5f6b73
    inverse: worldlineColor.grey[0], // white on dark / coloured surfaces
    link: worldlineColor.blue.primary // #0066a1 Worldline blue links
  },
  border: {
    subtle: worldlineColor.grey[200], // #e6e6e6 official light grey
    strong: worldlineColor.grey[400], // #c2c8cd
    interactive: worldlineColor.blue.primary // #0066a1
  },
  action: {
    primary: worldlineColor.blue.primary, // #0066a1 Worldline Blue
    primaryHover: worldlineColor.blue.hover, // #00517f
    primaryText: worldlineColor.grey[0], // white
    secondary: worldlineColor.blue.tint, // #e5eff5 light blue secondary surface
    secondaryHover: worldlineColor.blue.tintHover, // #d4e6f0
    secondaryText: worldlineColor.blue.primary, // #0066a1
    danger: worldlineColor.red.accent // #cc1a2b derived danger red
  },
  feedback: {
    success: worldlineColor.system.success, // #1f7a3d
    warning: worldlineColor.system.warning, // #b25e00
    error: worldlineColor.system.error, // #cc1a2b
    info: worldlineColor.system.info // #0066a1
  },
  status: {
    pending: worldlineColor.system.warning,
    processing: worldlineColor.system.info,
    completed: worldlineColor.system.success,
    failed: worldlineColor.system.error
  },
  // Categorical data-vis palette anchored on the Worldline blue (à confirmer).
  data: {
    category1: worldlineColor.data.blue, // #0066a1
    category2: worldlineColor.data.cyan, // #1f9bd1
    category3: worldlineColor.data.teal, // #00a3a3
    category4: worldlineColor.data.gold, // #f5a623
    category5: worldlineColor.data.green, // #1f7a3d
    category6: worldlineColor.data.purple, // #7a3a8c
    category7: worldlineColor.data.pink, // #d2569e
    category8: worldlineColor.data.slate // #2f3a42
  }
} as const;

/**
 * The Worldline theme as a Sentropic `TenantTheme`. The `component` layer is
 * REBUILT from this theme's own semantic/foundation via `createComponent`.
 */
export const worldlineTheme: TenantTheme = {
  id: "worldline",
  label: "Worldline",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default worldlineTheme;
