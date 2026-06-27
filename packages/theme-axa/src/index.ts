import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * AXA brand theme for the Sentropic token structure.
 *
 * All values below are MEASURED from AXA's PUBLIC brand identity: the canonical
 * AXA palette (deep "AXA Blue" #00008F + "AXA Red" #ff1721, white) published
 * across AXA's design guidelines and brand pages, and the corporate web
 * typeface (Source Sans Pro). We reference font *names* only — no binaries.
 * Sources are documented in MAPPING.md. AXA does not publish a full public CSS
 * token tree for greys/semantic roles, so the neutral scale and the
 * success/warning/info hues are DERIVED for WCAG AA on white and flagged
 * "à confirmer" in MAPPING.md.
 *
 * AXA colour reference (light):
 *   White (background default)        #ffffff
 *   Grey light (background alt)       #f4f4f8   (derived)
 *   Grey border subtle                #e1e1e8   (derived)
 *   Grey border strong                #c4c4d0   (derived)
 *   Grey text muted                   #6e6e80   (derived)
 *   Grey secondary text               #41415a   (derived)
 *   Near-black text primary           #16161d   (derived)
 *   AXA Blue (brand primary)          #00008f   (official AXA blue)
 *   AXA Blue interactive (hover)      #2a2aa8   (derived lighter interactive)
 *   AXA Blue dark                     #000063   (derived)
 *   AXA Red (accent / danger)         #ff1721   (official AXA red)
 *   Error red (AA on white)           #d5001c   (derived from AXA red)
 */

// --- AXA raw colour palette ------------------------------------------------
const axaColor = {
  // AXA Blue — the deep institutional brand / action family.
  blue: {
    primary: "#00008f", // official AXA Blue (the canonical brand colour)
    hover: "#2a2aa8", // derived lighter interactive blue (à confirmer)
    dark: "#000063", // derived darker blue (à confirmer)
    tint: "#e5e5f4", // derived light blue tint (à confirmer)
    tintHover: "#d6d6ec", // derived light blue hover (à confirmer)
    info: "#0061a8" // derived informational blue (à confirmer)
  },
  // AXA Red — the signature accent.
  red: {
    accent: "#ff1721", // official AXA Red
    error: "#d5001c" // derived darker red for WCAG AA text on white (à confirmer)
  },
  // Neutral grey scale (derived to harmonise with the AXA blue; à confirmer).
  grey: {
    0: "#ffffff",
    50: "#f4f4f8", // background alt (derived)
    100: "#efeff2", // card hover tint (derived)
    200: "#e1e1e8", // subtle border (derived)
    400: "#c4c4d0", // strong border / input border (derived)
    500: "#6e6e80", // muted text (derived)
    700: "#41415a", // secondary text (derived)
    900: "#16161d" // primary text, near-black (derived)
  },
  // System / status colours. AXA publishes the brand red; success/warning/info
  // are derived for WCAG AA on white (no public AXA token — à confirmer).
  system: {
    success: "#137c3b", // derived AA-safe green (à confirmer)
    warning: "#b25e00", // derived AA-safe amber (à confirmer)
    error: "#d5001c", // derived from AXA red for AA text (à confirmer)
    info: "#0061a8" // derived informational blue (à confirmer)
  },
  // Decorative / data-vis hues — coherent proposal anchored on the AXA blue/red
  // (AXA publishes no 8-colour sequential scale — à confirmer).
  data: {
    blue: "#00008f",
    red: "#ff1721",
    teal: "#0098b3",
    gold: "#d8a200",
    purple: "#6e3aa8",
    green: "#137c3b",
    pink: "#d2569e",
    slate: "#41415a"
  },
  // Focus ring colour (AXA blue, high-contrast outline).
  focus: "#00008f"
} as const;

// --- foundation (AXA-specific values) --------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family carries the AXA blue (brand action family).
    blue: {
      10: axaColor.blue.tint, // #e5e5f4 lightest blue tint
      60: axaColor.blue.primary, // #00008f AXA Blue (primary)
      80: axaColor.blue.hover // #2a2aa8 interactive blue
    },
    // AXA has no cyan; the closest accent is a derived teal (à confirmer).
    cyan: {
      10: "#e3f4f8", // light teal tint (derived — à confirmer)
      50: axaColor.data.teal, // #0098b3 derived teal accent (à confirmer)
      70: "#0a6f85" // darker teal (derived — à confirmer)
    },
    // Sentropic "slate" role family mapped onto the AXA neutral grey scale.
    slate: {
      0: axaColor.grey[0], // white
      10: axaColor.grey[50], // #f4f4f8 background alt
      20: axaColor.grey[200], // #e1e1e8 subtle borders
      60: axaColor.grey[700], // #41415a secondary text
      80: axaColor.grey[900], // #16161d primary text
      90: axaColor.blue.dark // #000063 darkest (AXA dark blue)
    },
    feedback: {
      success: axaColor.system.success,
      warning: axaColor.system.warning,
      error: axaColor.system.error,
      info: axaColor.system.info
    }
  },
  // AXA's corporate web typeface is Source Sans Pro (used for body, interactive
  // and display; headlines use heavier weights). No AXA mono face exists, so the
  // Sentropic mono stack is kept. Font *names* only — no binaries.
  font: {
    sans: "'Source Sans Pro', 'Source Sans 3', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    display: "'Source Sans Pro', 'Source Sans 3', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; AXA's public scale is not individually tokenised).
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
  // AXA aesthetic is CRISP / lightly rounded: buttons and cards carry small
  // radii (~4px), fields nearly square (~2px). Pills stay fully rounded.
  // (AXA radii are not published publicly — measured visually, à confirmer.)
  radius: {
    none: "0",
    sm: "0.125rem", // 2px — fields
    md: "0.25rem", // 4px — buttons / CTAs
    lg: "0.5rem", // 8px — cards / containers
    pill: "999px"
  },
  // Light neutral elevation on cards. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(22 22 29 / 0.10)",
    medium: "0 4px 12px rgb(22 22 29 / 0.14)",
    floating: "0 8px 24px rgb(22 22 29 / 0.18)"
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
  // --- Anatomy primitives (AXA) --------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // AXA control density — clean, mid-height controls (md ≈ 44px field height,
  // lg ≈ 52px CTA). Metrics "à confirmer".
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "0.875rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.0625rem" }
  },
  // AXA typography: Source Sans Pro across the board. Control labels are semibold.
  typography: {
    control: { family: "'Source Sans Pro', 'Source Sans 3', Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Source Sans Pro', 'Source Sans 3', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Source Sans Pro', 'Source Sans 3', Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // AXA links are the brand blue, underlined.
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
  // AXA FOCUS = a high-contrast AXA-blue OUTLINE offset from the control.
  // (Outline technique measured visually on AXA web properties — à confirmer width/offset.)
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: axaColor.focus, // #00008f AXA blue ring
    inset: "0"
  },
  // AXA form fields are BOXED (outline): white fill, 1px grey border, ~2px radius.
  field: {
    style: "outline",
    fillBg: axaColor.grey[0], // #ffffff
    underlineColor: axaColor.grey[400], // #c4c4d0
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in AXA blue.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2300008f' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // AXA cards: lightly rounded with a 1px subtle grey border and light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: axaColor.grey[100] // #efeff2
  },
  // AXA secondary button = white/ghost with AXA-blue text and a light blue hover.
  buttonSecondary: {
    background: "transparent",
    border: axaColor.blue.primary, // #00008f blue stroke
    hoverBackground: axaColor.blue.tintHover // #d6d6ec light blue hover
  },
  // AXA tabs: active tab = bold AXA-blue label with a bottom blue underline.
  tabs: {
    activeText: axaColor.blue.primary, // #00008f
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
  // AXA pagination: borderless blue links; active page = filled AXA blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: axaColor.blue.primary, // #00008f
    activeBackground: axaColor.blue.primary, // #00008f filled active
    activeText: axaColor.grey[0], // white
    activeBorderWidth: "0",
    paddingBlock: "0.25rem",
    paddingInline: "0.75rem",
    minSize: "2.25rem",
    fontSize: "1rem",
    lineHeight: "1.5rem"
  },
  // AXA breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: axaColor.blue.primary, // #00008f
    text: axaColor.grey[700], // #41415a
    currentText: axaColor.grey[900], // #16161d
    separator: axaColor.grey[400], // #c4c4d0
    fontSize: "0.875rem",
    lineHeight: "1.5rem",
    currentWeight: "700"
  },
  // AXA notice / alert: a coloured LEFT accent filet on a transparent box.
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
  // AXA accordion: an AXA-blue bold summary trigger.
  accordion: {
    text: axaColor.blue.primary, // #00008f
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    fontSize: "1rem",
    fontWeight: "600",
    lineHeight: "1.5rem"
  },
  // AXA tag: a small rounded grey chip.
  tag: {
    radius: "4px",
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    lineHeight: "1.5rem",
    minHeight: "1.5rem",
    neutralBackground: axaColor.grey[100], // #efeff2
    neutralText: axaColor.grey[900] // #16161d
  },
  // AXA badge: a small filled badge in brand blue.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "700",
    lineHeight: "1.5rem",
    textTransform: "none",
    minHeight: "1.5rem",
    infoBackground: axaColor.blue.primary, // #00008f
    infoText: axaColor.grey[0] // white
  },
  choice: {
    labelFontSize: "1rem",
    labelLineHeight: "1.5rem",
    radioLineHeight: "1.5rem",
    labelColor: axaColor.grey[900] // #16161d
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
    textColor: axaColor.grey[900] // #16161d
  }
} as const;

// --- semantic (AXA-specific role mapping) ----------------------------------
const semantic = {
  surface: {
    default: axaColor.grey[0], // white
    subtle: axaColor.grey[50], // #f4f4f8 background alt
    raised: axaColor.grey[0], // white
    inverse: axaColor.blue.primary, // #00008f AXA-blue inverse surface
    overlay: "rgb(0 0 143 / 0.6)" // modal backdrop (AXA blue tint)
  },
  text: {
    primary: axaColor.grey[900], // #16161d near-black
    secondary: axaColor.grey[700], // #41415a
    muted: axaColor.grey[500], // #6e6e80
    inverse: axaColor.grey[0], // white on dark / coloured surfaces
    link: axaColor.blue.primary // #00008f AXA blue links
  },
  border: {
    subtle: axaColor.grey[200], // #e1e1e8
    strong: axaColor.grey[400], // #c4c4d0
    interactive: axaColor.blue.primary // #00008f
  },
  action: {
    primary: axaColor.blue.primary, // #00008f AXA Blue
    primaryHover: axaColor.blue.hover, // #2a2aa8
    primaryText: axaColor.grey[0], // white
    secondary: axaColor.blue.tint, // #e5e5f4 light blue secondary surface
    secondaryHover: axaColor.blue.tintHover, // #d6d6ec
    secondaryText: axaColor.blue.primary, // #00008f
    danger: axaColor.red.accent // #ff1721 AXA Red
  },
  feedback: {
    success: axaColor.system.success, // #137c3b
    warning: axaColor.system.warning, // #b25e00
    error: axaColor.system.error, // #d5001c
    info: axaColor.system.info // #0061a8
  },
  status: {
    pending: axaColor.system.warning,
    processing: axaColor.system.info,
    completed: axaColor.system.success,
    failed: axaColor.system.error
  },
  // Categorical data-vis palette anchored on the AXA blue/red (à confirmer).
  data: {
    category1: axaColor.data.blue, // #00008f
    category2: axaColor.data.red, // #ff1721
    category3: axaColor.data.teal, // #0098b3
    category4: axaColor.data.gold, // #d8a200
    category5: axaColor.data.purple, // #6e3aa8
    category6: axaColor.data.green, // #137c3b
    category7: axaColor.data.pink, // #d2569e
    category8: axaColor.data.slate // #41415a
  }
} as const;

/**
 * The AXA theme as a Sentropic `TenantTheme`. The `component` layer is REBUILT
 * from this theme's own semantic/foundation via `createComponent`.
 */
export const axaTheme: TenantTheme = {
  id: "axa",
  label: "AXA",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default axaTheme;
