import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Edenred brand theme for the Sentropic token structure.
 *
 * All values below are MEASURED from Edenred's PUBLIC brand identity: the
 * canonical Edenred palette (the signature "Edenred Red" #f72717 — the red dot
 * at the heart of the logo — over a white hero colour, with a near-black from
 * the 14-colour secondary palette) and the brand typography (the proprietary
 * "Edenred" typeface, officially paired with Google's "Ubuntu"). We reference
 * font *names* only — no binaries. Sources are documented in MAPPING.md. Edenred
 * does not publish a full public CSS token tree for greys/semantic roles, so the
 * neutral scale and the success/warning/info hues are DERIVED for WCAG AA on
 * white and flagged "à confirmer" in MAPPING.md.
 *
 * Edenred colour reference (light):
 *   White (background default)        #ffffff
 *   Grey light (background alt)       #f7f6f5   (derived)
 *   Grey card hover tint              #efedec   (derived)
 *   Grey border subtle                #e3e0de   (derived)
 *   Grey border strong                #c6c1be   (derived)
 *   Grey text muted                   #6f6a67   (derived)
 *   Grey secondary text               #3c3835   (derived)
 *   Near-black text primary           #1a1614   (derived, Edenred near-black)
 *   Edenred Red (brand primary)       #f72717   (official Edenred Red — the dot)
 *   Edenred Red interactive (hover)   #d81f12   (derived darker red)
 *   Red light tint (secondary)        #fde7e4   (derived)
 *   Error red (AA on white)           #cc1810   (derived from Edenred red)
 */

// --- Edenred raw colour palette --------------------------------------------
const edenredColor = {
  // Edenred Red — the signature "red dot" brand / action family.
  red: {
    primary: "#f72717", // official Edenred Red (the canonical brand colour, the dot)
    hover: "#d81f12", // derived darker interactive red (à confirmer)
    tint: "#fde7e4", // derived light red tint (à confirmer)
    tintHover: "#fbd6d1", // derived light red hover (à confirmer)
    error: "#cc1810" // derived darker red for WCAG AA text on white (à confirmer)
  },
  // Edenred has no cyan; a derived blue accent fills the Sentropic cyan slot.
  accent: {
    tint: "#e2f0fb", // light blue tint (derived — à confirmer)
    base: "#0a6ebd", // derived blue accent / info (à confirmer)
    dark: "#075489" // darker blue (derived — à confirmer)
  },
  // Neutral grey scale (derived to harmonise with the Edenred red; à confirmer).
  grey: {
    0: "#ffffff",
    50: "#f7f6f5", // background alt (derived)
    100: "#efedec", // card hover tint (derived)
    200: "#e3e0de", // subtle border (derived)
    400: "#c6c1be", // strong border / input border (derived)
    500: "#6f6a67", // muted text (derived)
    700: "#3c3835", // secondary text (derived)
    900: "#1a1614" // primary text, near-black (derived)
  },
  // System / status colours. Edenred publishes the brand red; success/warning/info
  // are derived for WCAG AA on white (no public Edenred token — à confirmer).
  system: {
    success: "#1f8a4c", // derived AA-safe green (à confirmer)
    warning: "#b25e00", // derived AA-safe amber (à confirmer)
    error: "#cc1810", // derived from Edenred red for AA text (à confirmer)
    info: "#0a6ebd" // derived informational blue (à confirmer)
  },
  // Decorative / data-vis hues — coherent proposal anchored on the Edenred red
  // and the "vibrant" secondary palette (no official 8-colour scale — à confirmer).
  data: {
    red: "#f72717",
    blue: "#0a6ebd",
    gold: "#f5a623",
    green: "#1f8a4c",
    purple: "#7a3a8c",
    teal: "#00a3a3",
    pink: "#d2569e",
    slate: "#3c3835"
  },
  // Focus ring colour (Edenred red, high-contrast outline).
  focus: "#f72717"
} as const;

// --- foundation (Edenred-specific values) ----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family carries the Edenred RED (brand action family).
    blue: {
      10: edenredColor.red.tint, // #fde7e4 lightest red tint
      60: edenredColor.red.primary, // #f72717 Edenred Red (primary)
      80: edenredColor.red.hover // #d81f12 interactive red
    },
    // Edenred has no cyan; the closest accent is a derived blue (à confirmer).
    cyan: {
      10: edenredColor.accent.tint, // #e2f0fb light blue tint (derived — à confirmer)
      50: edenredColor.accent.base, // #0a6ebd derived blue accent (à confirmer)
      70: edenredColor.accent.dark // #075489 darker blue (derived — à confirmer)
    },
    // Sentropic "slate" role family mapped onto the Edenred neutral grey scale.
    slate: {
      0: edenredColor.grey[0], // white
      10: edenredColor.grey[50], // #f7f6f5 background alt
      20: edenredColor.grey[200], // #e3e0de subtle borders
      60: edenredColor.grey[700], // #3c3835 secondary text
      80: edenredColor.grey[900], // #1a1614 primary text
      90: edenredColor.grey[900] // #1a1614 darkest (Edenred near-black)
    },
    feedback: {
      success: edenredColor.system.success,
      warning: edenredColor.system.warning,
      error: edenredColor.system.error,
      info: edenredColor.system.info
    }
  },
  // Edenred ships a proprietary "Edenred" typeface, officially paired with
  // Google's "Ubuntu" as a companion. No Edenred mono face exists, so the
  // Sentropic mono stack is kept. Font *names* only — no binaries.
  font: {
    sans: "'Edenred', 'Ubuntu', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    display: "'Edenred', 'Ubuntu', system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; Edenred's public scale is not individually tokenised).
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
  // Edenred aesthetic is ROUNDED / digital-friendly, echoing the circular red
  // dot: fields ~4px, buttons ~8px, cards generously ~16px. Pills stay fully
  // rounded. (Edenred radii are not published publicly — measured visually, à confirmer.)
  radius: {
    none: "0",
    sm: "0.25rem", // 4px — fields
    md: "0.5rem", // 8px — buttons / CTAs
    lg: "1rem", // 16px — cards / containers
    pill: "999px"
  },
  // Light neutral elevation on cards (Edenred near-black tint). Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(26 22 20 / 0.10)",
    medium: "0 4px 12px rgb(26 22 20 / 0.14)",
    floating: "0 8px 24px rgb(26 22 20 / 0.18)"
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
  // --- Anatomy primitives (Edenred) ----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Edenred control density — clean, mid-height controls (md ≈ 44px field height,
  // lg ≈ 52px CTA). Metrics "à confirmer".
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "0.875rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.0625rem" }
  },
  // Edenred typography: the "Edenred" typeface (Ubuntu companion) across the board.
  // Control labels are semibold.
  typography: {
    control: { family: "'Edenred', 'Ubuntu', system-ui, Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Edenred', 'Ubuntu', system-ui, Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Edenred', 'Ubuntu', system-ui, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Edenred links are the brand red, underlined.
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
  // Edenred FOCUS = a high-contrast Edenred-red OUTLINE offset from the control.
  // (Outline technique measured visually on Edenred web properties — à confirmer width/offset.)
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: edenredColor.focus, // #f72717 Edenred red ring
    inset: "0"
  },
  // Edenred form fields are BOXED (outline): white fill, 1px grey border, ~4px radius.
  field: {
    style: "outline",
    fillBg: edenredColor.grey[0], // #ffffff
    underlineColor: edenredColor.grey[400], // #c6c1be
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Edenred red.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23f72717' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Edenred cards: generously rounded with a 1px subtle grey border and light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: edenredColor.grey[100] // #efedec
  },
  // Edenred secondary button = white/ghost with Edenred-red text and a light red hover.
  buttonSecondary: {
    background: "transparent",
    border: edenredColor.red.primary, // #f72717 red stroke
    hoverBackground: edenredColor.red.tintHover // #fbd6d1 light red hover
  },
  // Edenred tabs: active tab = bold Edenred-red label with a bottom red underline.
  tabs: {
    activeText: edenredColor.red.primary, // #f72717
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
  // Edenred pagination: borderless red links; active page = filled Edenred red.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: edenredColor.red.primary, // #f72717
    activeBackground: edenredColor.red.primary, // #f72717 filled active
    activeText: edenredColor.grey[0], // white
    activeBorderWidth: "0",
    paddingBlock: "0.25rem",
    paddingInline: "0.75rem",
    minSize: "2.25rem",
    fontSize: "1rem",
    lineHeight: "1.5rem"
  },
  // Edenred breadcrumb: red links, dark current page, grey separators.
  breadcrumb: {
    linkText: edenredColor.red.primary, // #f72717
    text: edenredColor.grey[700], // #3c3835
    currentText: edenredColor.grey[900], // #1a1614
    separator: edenredColor.grey[400], // #c6c1be
    fontSize: "0.875rem",
    lineHeight: "1.5rem",
    currentWeight: "700"
  },
  // Edenred notice / alert: a coloured LEFT accent filet on a transparent box.
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
  // Edenred accordion: an Edenred-red bold summary trigger.
  accordion: {
    text: edenredColor.red.primary, // #f72717
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    fontSize: "1rem",
    fontWeight: "600",
    lineHeight: "1.5rem"
  },
  // Edenred tag: a small rounded grey chip (rounded brand → 8px).
  tag: {
    radius: "0.5rem",
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    lineHeight: "1.5rem",
    minHeight: "1.5rem",
    neutralBackground: edenredColor.grey[100], // #efedec
    neutralText: edenredColor.grey[900] // #1a1614
  },
  // Edenred badge: a small filled badge in brand red.
  badge: {
    radius: "0.5rem",
    paddingBlock: "0",
    paddingInline: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "700",
    lineHeight: "1.5rem",
    textTransform: "none",
    minHeight: "1.5rem",
    infoBackground: edenredColor.red.primary, // #f72717
    infoText: edenredColor.grey[0] // white
  },
  choice: {
    labelFontSize: "1rem",
    labelLineHeight: "1.5rem",
    radioLineHeight: "1.5rem",
    labelColor: edenredColor.grey[900] // #1a1614
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
    textColor: edenredColor.grey[900] // #1a1614
  }
} as const;

// --- semantic (Edenred-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: edenredColor.grey[0], // white
    subtle: edenredColor.grey[50], // #f7f6f5 background alt
    raised: edenredColor.grey[0], // white
    inverse: edenredColor.grey[900], // #1a1614 Edenred near-black inverse surface
    overlay: "rgb(26 22 20 / 0.6)" // modal backdrop (Edenred near-black tint)
  },
  text: {
    primary: edenredColor.grey[900], // #1a1614 near-black
    secondary: edenredColor.grey[700], // #3c3835
    muted: edenredColor.grey[500], // #6f6a67
    inverse: edenredColor.grey[0], // white on dark / coloured surfaces
    link: edenredColor.red.primary // #f72717 Edenred red links
  },
  border: {
    subtle: edenredColor.grey[200], // #e3e0de
    strong: edenredColor.grey[400], // #c6c1be
    interactive: edenredColor.red.primary // #f72717
  },
  action: {
    primary: edenredColor.red.primary, // #f72717 Edenred Red
    primaryHover: edenredColor.red.hover, // #d81f12
    primaryText: edenredColor.grey[0], // white
    secondary: edenredColor.red.tint, // #fde7e4 light red secondary surface
    secondaryHover: edenredColor.red.tintHover, // #fbd6d1
    secondaryText: edenredColor.red.primary, // #f72717
    danger: edenredColor.red.primary // #f72717 Edenred Red
  },
  feedback: {
    success: edenredColor.system.success, // #1f8a4c
    warning: edenredColor.system.warning, // #b25e00
    error: edenredColor.system.error, // #cc1810
    info: edenredColor.system.info // #0a6ebd
  },
  status: {
    pending: edenredColor.system.warning,
    processing: edenredColor.system.info,
    completed: edenredColor.system.success,
    failed: edenredColor.system.error
  },
  // Categorical data-vis palette anchored on the Edenred red (à confirmer).
  data: {
    category1: edenredColor.data.red, // #f72717
    category2: edenredColor.data.blue, // #0a6ebd
    category3: edenredColor.data.gold, // #f5a623
    category4: edenredColor.data.green, // #1f8a4c
    category5: edenredColor.data.purple, // #7a3a8c
    category6: edenredColor.data.teal, // #00a3a3
    category7: edenredColor.data.pink, // #d2569e
    category8: edenredColor.data.slate // #3c3835
  }
} as const;

/**
 * The Edenred theme as a Sentropic `TenantTheme`. The `component` layer is
 * REBUILT from this theme's own semantic/foundation via `createComponent`.
 */
export const edenredTheme: TenantTheme = {
  id: "edenred",
  label: "Edenred",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default edenredTheme;
