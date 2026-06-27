import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Crédit Agricole brand theme for the Sentropic token structure.
 *
 * All anchor values below are MEASURED from Crédit Agricole's PUBLIC brand
 * identity — the "banque verte": the canonical CA green `#006f4e` ("Tropical
 * Rain Forest" green), the corporate teal `#009b9d` ("Persian Green") and the
 * CA red accent `#ed1c24`, on white. Sources are documented in MAPPING.md.
 * Crédit Agricole's corporate face is a custom sans with no confirmed public
 * webfont name, so a neutral humanist sans stack is used (font *names* only —
 * no binaries). CA does not publish a full public CSS token tree for greys and
 * semantic roles, so the neutral scale, the success/warning/info hues and the
 * radius/focus metrics are DERIVED for WCAG AA on white and flagged
 * "à confirmer" in MAPPING.md.
 *
 * Crédit Agricole colour reference (light):
 *   White (background default)        #ffffff
 *   Grey light (background alt)       #f4f6f5   (derived, faint green-grey)
 *   Grey card hover                   #eceeed   (derived)
 *   Grey border subtle                #dfe3e1   (derived)
 *   Grey border strong                #c0c6c3   (derived)
 *   Grey text muted                   #6a716e   (derived)
 *   Grey secondary text               #3a423f   (derived)
 *   Near-black text primary           #16201b   (derived, dark green-grey)
 *   CA Green (brand primary)          #006f4e   (official "banque verte" green)
 *   CA Green hover                    #00553c   (derived darker green)
 *   CA Dark green (inverse surface)   #04392a   (derived darkest green)
 *   CA Teal / Persian Green (accent)  #009b9d   (official corporate teal)
 *   CA Red (accent / danger)          #ed1c24   (official CA red)
 *   Error red (AA on white)           #cc1019   (derived darker CA red)
 */

// --- Crédit Agricole raw colour palette ------------------------------------
const caColor = {
  // CA Green — the "banque verte" primary brand / action family.
  green: {
    primary: "#006f4e", // official CA green ("Tropical Rain Forest", brandcolorcode)
    hover: "#00553c", // derived darker interactive green (à confirmer)
    dark: "#04392a", // derived darkest green surface (à confirmer)
    tint: "#e5f1ec", // derived light green tint (à confirmer)
    tintHover: "#d5e8e0" // derived light green hover (à confirmer)
  },
  // CA Teal ("Persian Green") — the signature secondary accent.
  teal: {
    accent: "#009b9d", // official CA teal (brandcolorcode; coloropedia #00969a)
    tint: "#e0f3f3", // derived light teal tint (à confirmer)
    dark: "#00727a" // derived darker teal (also info hue) (à confirmer)
  },
  // CA Red — the signature warm accent.
  red: {
    accent: "#ed1c24", // official CA red
    error: "#cc1019" // derived darker red for WCAG AA text on white (à confirmer)
  },
  // Neutral grey scale (derived to harmonise with the CA green; à confirmer).
  grey: {
    0: "#ffffff",
    50: "#f4f6f5", // background alt (derived, faint green-grey)
    100: "#eceeed", // card hover tint (derived)
    200: "#dfe3e1", // subtle border (derived)
    400: "#c0c6c3", // strong border / input border (derived)
    500: "#6a716e", // muted text (derived)
    700: "#3a423f", // secondary text (derived)
    900: "#16201b" // primary text, near-black green-grey (derived)
  },
  // System / status colours. CA publishes the brand green and red; the brand
  // green doubles as success, info derives from the CA teal, and warning is a
  // CA-flavoured amber — all checked for WCAG AA on white (à confirmer).
  system: {
    success: "#006f4e", // CA green doubles as success (à confirmer)
    warning: "#b25e00", // derived AA-safe amber (à confirmer)
    error: "#cc1019", // derived darker CA red for AA text (à confirmer)
    info: "#00727a" // derived from the CA teal (à confirmer)
  },
  // Decorative / data-vis hues — coherent proposal anchored on the CA
  // green/teal/red (CA publishes no 8-colour sequential scale — à confirmer).
  data: {
    green: "#006f4e",
    teal: "#009b9d",
    red: "#ed1c24",
    amber: "#b25e00",
    lightGreen: "#3a8a5c",
    purple: "#6e3aa8",
    pink: "#d2569e",
    slate: "#3a423f"
  },
  // Focus ring colour (CA green, high-contrast outline).
  focus: "#006f4e"
} as const;

// --- foundation (Crédit Agricole-specific values) --------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family carries the CA green (CA has no blue brand
    // colour; the brand action family is the "banque verte" green — à confirmer).
    blue: {
      10: caColor.green.tint, // #e5f1ec lightest green tint
      60: caColor.green.primary, // #006f4e CA green (primary)
      80: caColor.green.hover // #00553c interactive green
    },
    // Sentropic "cyan" accent slot carries the CA teal ("Persian Green").
    cyan: {
      10: caColor.teal.tint, // #e0f3f3 light teal tint (derived — à confirmer)
      50: caColor.teal.accent, // #009b9d CA teal accent
      70: caColor.teal.dark // #00727a darker teal (derived — à confirmer)
    },
    // Sentropic "slate" role family mapped onto the CA neutral grey scale.
    slate: {
      0: caColor.grey[0], // white
      10: caColor.grey[50], // #f4f6f5 background alt
      20: caColor.grey[200], // #dfe3e1 subtle borders
      60: caColor.grey[700], // #3a423f secondary text
      80: caColor.grey[900], // #16201b primary text
      90: caColor.green.dark // #04392a darkest (CA dark green)
    },
    feedback: {
      success: caColor.system.success,
      warning: caColor.system.warning,
      error: caColor.system.error,
      info: caColor.system.info
    }
  },
  // Crédit Agricole uses a custom corporate sans with no confirmed public
  // webfont name, so a neutral humanist sans stack carries body, interactive and
  // display. No CA mono face exists, so the Sentropic mono stack is kept. Font
  // *names* only — no binaries. (Stack flagged à confirmer in MAPPING.md.)
  font: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
    display: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; CA's public scale is not individually tokenised).
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
  // CA aesthetic is APPROACHABLE / gently ROUNDED: buttons carry a ~6px radius,
  // cards ~12px, fields ~3px. Pills stay fully rounded.
  // (CA radii are not published publicly — measured visually, à confirmer.)
  radius: {
    none: "0",
    sm: "0.1875rem", // 3px — fields
    md: "0.375rem", // 6px — buttons / CTAs
    lg: "0.75rem", // 12px — cards / containers
    pill: "999px"
  },
  // Light neutral elevation on cards. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(22 32 27 / 0.10)",
    medium: "0 4px 12px rgb(22 32 27 / 0.14)",
    floating: "0 8px 24px rgb(22 32 27 / 0.18)"
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
  // --- Anatomy primitives (Crédit Agricole) --------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // CA control density — clean, mid-height controls (md ≈ 44px field height,
  // lg ≈ 52px CTA). Metrics "à confirmer".
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "0.875rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.0625rem" }
  },
  // CA typography: neutral humanist sans across the board. Control labels are semibold.
  typography: {
    control: { family: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // CA links are the brand green, underlined.
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
  // CA FOCUS = a high-contrast CA-green OUTLINE offset from the control.
  // (Outline technique measured visually on CA web properties — à confirmer width/offset.)
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: caColor.focus, // #006f4e CA green ring
    inset: "0"
  },
  // CA form fields are BOXED (outline): white fill, 1px grey border, ~3px radius.
  field: {
    style: "outline",
    fillBg: caColor.grey[0], // #ffffff
    underlineColor: caColor.grey[400], // #c0c6c3
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in CA green.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23006f4e' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // CA cards: gently rounded with a 1px subtle grey border and light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: caColor.grey[100] // #eceeed
  },
  // CA secondary button = white/ghost with CA-green text and a light green hover.
  buttonSecondary: {
    background: "transparent",
    border: caColor.green.primary, // #006f4e green stroke
    hoverBackground: caColor.green.tintHover // #d5e8e0 light green hover
  },
  // CA tabs: active tab = bold CA-green label with a bottom green underline.
  tabs: {
    activeText: caColor.green.primary, // #006f4e
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
  // CA pagination: borderless green links; active page = filled CA green.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: caColor.green.primary, // #006f4e
    activeBackground: caColor.green.primary, // #006f4e filled active
    activeText: caColor.grey[0], // white
    activeBorderWidth: "0",
    paddingBlock: "0.25rem",
    paddingInline: "0.75rem",
    minSize: "2.25rem",
    fontSize: "1rem",
    lineHeight: "1.5rem"
  },
  // CA breadcrumb: green links, dark current page, grey separators.
  breadcrumb: {
    linkText: caColor.green.primary, // #006f4e
    text: caColor.grey[700], // #3a423f
    currentText: caColor.grey[900], // #16201b
    separator: caColor.grey[400], // #c0c6c3
    fontSize: "0.875rem",
    lineHeight: "1.5rem",
    currentWeight: "700"
  },
  // CA notice / alert: a coloured LEFT accent filet on a transparent box.
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
  // CA accordion: a CA-green bold summary trigger.
  accordion: {
    text: caColor.green.primary, // #006f4e
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    fontSize: "1rem",
    fontWeight: "600",
    lineHeight: "1.5rem"
  },
  // CA tag: a small rounded grey chip.
  tag: {
    radius: "4px",
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    lineHeight: "1.5rem",
    minHeight: "1.5rem",
    neutralBackground: caColor.grey[100], // #eceeed
    neutralText: caColor.grey[900] // #16201b
  },
  // CA badge: a small filled badge in brand green.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "700",
    lineHeight: "1.5rem",
    textTransform: "none",
    minHeight: "1.5rem",
    infoBackground: caColor.green.primary, // #006f4e
    infoText: caColor.grey[0] // white
  },
  choice: {
    labelFontSize: "1rem",
    labelLineHeight: "1.5rem",
    radioLineHeight: "1.5rem",
    labelColor: caColor.grey[900] // #16201b
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
    textColor: caColor.grey[900] // #16201b
  }
} as const;

// --- semantic (Crédit Agricole-specific role mapping) ----------------------
const semantic = {
  surface: {
    default: caColor.grey[0], // white
    subtle: caColor.grey[50], // #f4f6f5 background alt
    raised: caColor.grey[0], // white
    inverse: caColor.green.dark, // #04392a CA dark-green inverse surface
    overlay: "rgb(4 57 42 / 0.6)" // modal backdrop (CA dark-green tint)
  },
  text: {
    primary: caColor.grey[900], // #16201b near-black
    secondary: caColor.grey[700], // #3a423f
    muted: caColor.grey[500], // #6a716e
    inverse: caColor.grey[0], // white on dark / coloured surfaces
    link: caColor.green.primary // #006f4e CA green links
  },
  border: {
    subtle: caColor.grey[200], // #dfe3e1
    strong: caColor.grey[400], // #c0c6c3
    interactive: caColor.green.primary // #006f4e
  },
  action: {
    primary: caColor.green.primary, // #006f4e CA green
    primaryHover: caColor.green.hover, // #00553c
    primaryText: caColor.grey[0], // white
    secondary: caColor.green.tint, // #e5f1ec light green secondary surface
    secondaryHover: caColor.green.tintHover, // #d5e8e0
    secondaryText: caColor.green.primary, // #006f4e
    danger: caColor.red.accent // #ed1c24 CA Red
  },
  feedback: {
    success: caColor.system.success, // #006f4e
    warning: caColor.system.warning, // #b25e00
    error: caColor.system.error, // #cc1019
    info: caColor.system.info // #00727a
  },
  status: {
    pending: caColor.system.warning,
    processing: caColor.system.info,
    completed: caColor.system.success,
    failed: caColor.system.error
  },
  // Categorical data-vis palette anchored on the CA green/teal/red (à confirmer).
  data: {
    category1: caColor.data.green, // #006f4e
    category2: caColor.data.teal, // #009b9d
    category3: caColor.data.red, // #ed1c24
    category4: caColor.data.amber, // #b25e00
    category5: caColor.data.lightGreen, // #3a8a5c
    category6: caColor.data.purple, // #6e3aa8
    category7: caColor.data.pink, // #d2569e
    category8: caColor.data.slate // #3a423f
  }
} as const;

/**
 * The Crédit Agricole theme as a Sentropic `TenantTheme`. The `component` layer
 * is REBUILT from this theme's own semantic/foundation via `createComponent`.
 */
export const creditAgricoleTheme: TenantTheme = {
  id: "credit-agricole",
  label: "Crédit Agricole",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default creditAgricoleTheme;
