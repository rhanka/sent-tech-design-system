import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Saint-Gobain brand theme for the Sentropic token structure.
 *
 * This is a MEASURED-CLONE of the PUBLIC Saint-Gobain brand identity (the
 * corporate site saint-gobain.com and published brand-colour references). We
 * only reference font *names* (Poppins) here, never font binaries. Sources and
 * exact provenance are documented in MAPPING.md. Where Saint-Gobain has no
 * direct equivalent for a Sentropic role, the closest brand value (or a derived
 * tint) is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Saint-Gobain colour reference (light theme):
 *   Brand blue (wordmark / action / link)   #17428C   Pantone 7687 C
 *   Brand light blue (accent / info)         #249DD9   Pantone 7689 C
 *   Brand turquoise (accent)                 #67B9B0   Pantone 563 C
 *   Brand red (danger / error)               #D62A29   Pantone 1795 C
 *   Brand orange (warning / accent)          #E5531A   Pantone 1595 C
 *   White (background default)               #ffffff
 *   Body / primary text (slate)              #1c2430   (neutral scale, à confirmer)
 */

// --- Saint-Gobain raw colour palette ---------------------------------------
const saintGobainColor = {
  // Brand blue — the Saint-Gobain wordmark blue and the action / link family.
  blue: {
    primary: "#17428C", // Saint-Gobain wordmark blue, Pantone 7687 C (action / link / brand)
    hover: "#0f3068", // derived darker blue for hover/active (à confirmer)
    deep: "#0a2350", // derived deep blue (à confirmer)
    light: "#e5eaf3" // derived light blue tint for low-emphasis surfaces (à confirmer)
  },
  // Brand secondary accents — light blue and turquoise from the Saint-Gobain
  // palette. The Sentropic "cyan" accent slot maps to the brand light blue.
  accent: {
    lightBlue: "#249DD9", // Saint-Gobain light blue, Pantone 7689 C
    turquoise: "#67B9B0", // Saint-Gobain turquoise, Pantone 563 C
    lightBlueLight: "#e3f4fb", // derived light-blue tint (à confirmer)
    lightBlueDark: "#1a7aad" // derived darker light-blue (à confirmer)
  },
  // Brand red — the iconic Saint-Gobain red, used for danger / error emphasis.
  red: {
    main: "#D62A29", // Saint-Gobain red, Pantone 1795 C (danger)
    light: "#fbe3e2" // light red tint (derived — à confirmer)
  },
  // Brand orange — Saint-Gobain orange (warning role / decorative accent).
  orange: {
    main: "#E5531A" // Saint-Gobain orange, Pantone 1595 C
  },
  // Neutral grey scale (derived to pair with the brand blue — à confirmer).
  grey: {
    0: "#ffffff", // white / body background
    50: "#f4f6f9", // background alt
    200: "#d3dae3", // subtle border / field stroke
    500: "#667085", // secondary text
    600: "#4a5365", // muted text
    800: "#1c2430", // primary text / dark slate
    900: "#0f1620" // darkest
  },
  // System / status colours. warning = brand orange, error = brand red,
  // info = brand light blue; success is a derived green (à confirmer).
  system: {
    success: "#2e9e5b", // derived green (à confirmer)
    warning: "#E5531A", // Saint-Gobain orange
    error: "#D62A29", // Saint-Gobain red
    info: "#249DD9" // Saint-Gobain light blue
  }
} as const;

// --- foundation (Saint-Gobain-specific values) -----------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Saint-Gobain brand blue.
    blue: {
      10: saintGobainColor.blue.light, // lightest blue tint
      60: saintGobainColor.blue.primary, // #17428C primary
      80: saintGobainColor.blue.hover // #0f3068 darker interactive blue
    },
    // Sentropic "cyan" accent slot mapped onto the Saint-Gobain brand light blue.
    cyan: {
      10: saintGobainColor.accent.lightBlueLight, // light-blue tint
      50: saintGobainColor.accent.lightBlue, // #249DD9 brand light blue accent
      70: saintGobainColor.accent.lightBlueDark // #1a7aad darker light blue
    },
    // Sentropic "slate" role family mapped onto the grey scale.
    slate: {
      0: saintGobainColor.grey[0], // white
      10: saintGobainColor.grey[50], // background alt
      20: saintGobainColor.grey[200], // subtle borders / field stroke
      60: saintGobainColor.grey[500], // secondary text
      80: saintGobainColor.grey[800], // primary text
      90: saintGobainColor.grey[900] // darkest
    },
    feedback: {
      success: saintGobainColor.system.success,
      warning: saintGobainColor.system.warning,
      error: saintGobainColor.system.error,
      info: saintGobainColor.system.info
    }
  },
  // Saint-Gobain uses Poppins — a geometric public sans approximating the brand
  // wordmark (Avant Garde Gothic style) — for both body and display titles
  // (à confirmer); mono is the system stack. We reference the font *names* only.
  font: {
    sans: "'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
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
  // Saint-Gobain aesthetic is lightly rounded: controls/inputs carry a 4px
  // radius, cards a slightly larger 8px radius (à confirmer).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.25rem", // 4px — button / input / tabs
    lg: "0.5rem", // 8px — cards
    pill: "999px" // tags / pills
  },
  // Light, neutral elevation tinted with the brand slate. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(28 36 48 / 0.10)",
    medium: "0 4px 12px rgb(28 36 48 / 0.14)",
    floating: "0 8px 24px rgb(28 36 48 / 0.18)"
  },
  // Motion durations are not strongly tokenised by the brand site publicly; kept
  // aligned with the Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not brand-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Saint-Gobain) -----------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density targets ~40px medium controls with 0.75rem inline padding.
  // sm/lg follow the standard size scale ("à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Saint-Gobain typography: Poppins for interactive/fields/labels and display.
  // Button labels use a medium weight (500), no transform.
  typography: {
    control: { family: "'Poppins', system-ui, sans-serif", size: "1rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Poppins', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Poppins', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are blue #17428C, not underlined at rest, underlined on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // disabled controls dim to 0.5 (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a high-contrast OUTLINE in the brand blue #17428C.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: saintGobainColor.blue.primary, // #17428C brand blue outline
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px grey border and a 4px
  // radius. `style: "outline"` makes the builder draw four equal borders from
  // `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: saintGobainColor.grey[0], // #ffffff
    underlineColor: saintGobainColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the brand blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2317428C' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + slight radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: saintGobainColor.grey[50] // #f4f6f9
  },
  // Secondary button = OUTLINED in the brand light blue: transparent fill,
  // light-blue border + text, light fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: saintGobainColor.accent.lightBlue, // #249DD9 brand light-blue stroke
    hoverBackground: saintGobainColor.accent.lightBlueLight // #e3f4fb light fill on hover
  },
  // Tabs / top-nav: active tab = bold blue label with a bottom blue underline.
  tabs: {
    activeText: saintGobainColor.blue.primary, // #17428C
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: borderless blue text links; active page = filled brand blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: saintGobainColor.blue.primary, // #17428C link text
    activeBackground: saintGobainColor.blue.primary, // #17428C filled active page
    activeText: saintGobainColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: saintGobainColor.blue.primary, // #17428C
    text: saintGobainColor.grey[500], // #667085 trail text
    currentText: saintGobainColor.grey[800], // #1c2430 current page
    separator: saintGobainColor.grey[500], // #667085
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700"
  },
  // Alert / notice: a coloured LEFT accent filet on a transparent box.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Accordion / details: a dark bold summary trigger.
  accordion: {
    text: saintGobainColor.grey[800], // #1c2430 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: a small 4px-radius grey chip.
  tag: {
    radius: "4px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: saintGobainColor.grey[50], // #f4f6f9
    neutralText: saintGobainColor.grey[800] // #1c2430
  },
  // Badge: a 4px-radius filled badge.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: saintGobainColor.blue.primary, // #17428C
    infoText: saintGobainColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: saintGobainColor.grey[800] // #1c2430
  },
  // Search input.
  search: {
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: saintGobainColor.grey[800] // #1c2430
  }
} as const;

// --- semantic (Saint-Gobain-specific role mapping) -------------------------
const semantic = {
  surface: {
    default: saintGobainColor.grey[0], // white
    subtle: saintGobainColor.grey[50], // #f4f6f9 background alt
    raised: saintGobainColor.grey[0], // white
    inverse: saintGobainColor.grey[800], // #1c2430 dark slate inverse surface (à confirmer)
    overlay: "rgb(28 36 48 / 0.6)" // modal backdrop (brand slate tint)
  },
  text: {
    primary: saintGobainColor.grey[800], // #1c2430 body text
    secondary: saintGobainColor.grey[500], // #667085 secondary text
    muted: saintGobainColor.grey[600], // #4a5365 muted text
    inverse: saintGobainColor.grey[0], // white on dark / coloured surfaces
    link: saintGobainColor.blue.primary // #17428C brand blue link
  },
  border: {
    subtle: saintGobainColor.grey[200], // #d3dae3 (field stroke)
    strong: saintGobainColor.grey[500], // #667085
    interactive: saintGobainColor.blue.primary // #17428C focus / interactive
  },
  action: {
    primary: saintGobainColor.blue.primary, // #17428C primary button
    primaryHover: saintGobainColor.blue.hover, // #0f3068 darker hover (à confirmer)
    primaryText: saintGobainColor.grey[0], // white text on blue
    secondary: saintGobainColor.grey[50], // #f4f6f9 secondary surface
    secondaryHover: saintGobainColor.grey[200], // #d3dae3
    secondaryText: saintGobainColor.blue.primary, // #17428C
    danger: saintGobainColor.red.main // #D62A29 brand red
  },
  feedback: {
    success: saintGobainColor.system.success,
    warning: saintGobainColor.system.warning,
    error: saintGobainColor.system.error,
    info: saintGobainColor.system.info
  },
  status: {
    pending: saintGobainColor.system.warning,
    processing: saintGobainColor.system.info,
    completed: saintGobainColor.system.success,
    failed: saintGobainColor.system.error
  },
  // Categorical data-vis palette built from the brand hues. Saint-Gobain does
  // not publish an 8-colour sequential scale, so this is a coherent proposal
  // drawn from the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: saintGobainColor.blue.primary, // #17428C brand blue
    category2: saintGobainColor.accent.lightBlue, // #249DD9 light blue
    category3: saintGobainColor.accent.turquoise, // #67B9B0 turquoise
    category4: saintGobainColor.orange.main, // #E5531A orange
    category5: saintGobainColor.red.main, // #D62A29 red
    category6: saintGobainColor.system.success, // #2e9e5b green
    category7: saintGobainColor.blue.deep, // #0a2350 deep blue
    category8: saintGobainColor.accent.lightBlueDark // #1a7aad darker light blue
  }
} as const;

/**
 * The Saint-Gobain theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Saint-Gobain-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Saint-Gobain brand reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const saintGobainTheme: TenantTheme = {
  id: "saint-gobain",
  label: "Saint-Gobain",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default saintGobainTheme;
