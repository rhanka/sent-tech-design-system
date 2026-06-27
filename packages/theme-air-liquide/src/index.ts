import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Air Liquide brand theme for the Sentropic token structure.
 *
 * Values below are a MEASURED CLONE of the PUBLIC Air Liquide brand identity:
 * the two signature brand colours (corporate blue, "Unique Red") are taken from
 * the published 2017 visual-identity / press material and public brand-colour
 * references; we only reference the font *names* here, never font binaries.
 * Sources and exact provenance are documented in MAPPING.md. Air Liquide does
 * not publish a full token system (grey scale, hover/light tints, feedback
 * colours), so those are DERIVED and flagged "à confirmer" in MAPPING.md.
 *
 * Air Liquide colour reference (light theme):
 *   White (background default)        #ffffff   (brand background)
 *   Corporate blue (action / link)    #375F9B   (Pantone 7684 C — primary brand blue)
 *   "Unique Red" (danger / accent)    #D7001E   (Pantone 2035 C — iconic brand red)
 *   Body / primary text               #1f2a3a   (derived dark slate — à confirmer)
 *   Secondary / muted grey            #6b7785   (derived neutral — à confirmer)
 */

// --- Air Liquide raw colour palette ---------------------------------------
const airLiquideColor = {
  // Corporate blue — the brand action / link family (Pantone 7684 C).
  blue: {
    primary: "#375F9B", // Air Liquide corporate blue, Pantone 7684 C (action/link/brand)
    hover: "#2c4d80", // derived darker blue (à confirmer)
    deep: "#1f3a66", // derived deep blue (à confirmer)
    light: "#e6ecf5" // derived light blue tint (à confirmer)
  },
  // Air Liquide "Unique Red" — the iconic brand accent (Pantone 2035 C). Used
  // as a strong accent / danger hue; occupies the Sentropic "cyan" accent slot.
  red: {
    main: "#D7001E", // Air Liquide "Unique Red", Pantone 2035 C (danger/accent)
    light: "#fbe0e4", // derived light red tint (à confirmer)
    dark: "#a8001a" // derived dark red (à confirmer)
  },
  // Neutral grey scale — Air Liquide does not publish a grey scale, so this is
  // a derived neutral ramp tuned to the brand slate (à confirmer).
  grey: {
    0: "#ffffff", // white / background
    50: "#f5f7fa", // background alt
    200: "#d5dce5", // subtle border / field stroke
    500: "#6b7785", // secondary text
    600: "#5a6573", // muted text
    800: "#1f2a3a", // primary text / dark slate
    900: "#111827" // darkest
  },
  // System / status colours — derived (error/info reuse the brand colours).
  system: {
    success: "#2e9e5b", // derived green (à confirmer)
    error: "#D7001E", // brand red used for destructive / error emphasis
    warning: "#e0820b", // derived amber (à confirmer)
    info: "#375F9B" // brand blue used for informational emphasis
  }
} as const;

// --- foundation (Air Liquide-specific values) ------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Air Liquide corporate blue.
    blue: {
      10: airLiquideColor.blue.light, // lightest blue tint
      60: airLiquideColor.blue.primary, // #375F9B primary
      80: airLiquideColor.blue.hover // #2c4d80 darker interactive blue
    },
    // Air Liquide has no dedicated cyan accent; the closest brand accent is the
    // iconic "Unique Red", so the Sentropic "cyan" accent slot maps to the red.
    cyan: {
      10: airLiquideColor.red.light, // light red tint
      50: airLiquideColor.red.main, // #D7001E brand red accent
      70: airLiquideColor.red.dark // darker red
    },
    // Sentropic "slate" role family mapped onto the grey scale.
    slate: {
      0: airLiquideColor.grey[0], // white
      10: airLiquideColor.grey[50], // background alt
      20: airLiquideColor.grey[200], // subtle borders / field stroke
      60: airLiquideColor.grey[500], // secondary text
      80: airLiquideColor.grey[800], // primary text
      90: airLiquideColor.grey[900] // darkest
    },
    feedback: {
      success: airLiquideColor.system.success,
      warning: airLiquideColor.system.warning,
      error: airLiquideColor.system.error,
      info: airLiquideColor.system.info
    }
  },
  // Air Liquide's proprietary corporate typeface is "Alfa"; we approximate it
  // publicly with "Montserrat" (a geometric sans of comparable proportions) for
  // both display and body. We reference the font *names* only, not the binaries.
  font: {
    sans: "'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
  // Air Liquide aesthetic is lightly rounded: controls/inputs carry a 4px radius,
  // cards a slightly larger 8px radius.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.25rem", // 4px — button / input / tabs
    lg: "0.5rem", // 8px — cards
    pill: "999px" // tags / pills
  },
  // Light, neutral elevation tinted with the brand slate. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(31 42 58 / 0.10)",
    medium: "0 4px 12px rgb(31 42 58 / 0.14)",
    floating: "0 8px 24px rgb(31 42 58 / 0.18)"
  },
  // Motion durations are not published by the brand; kept aligned with the
  // Sentropic base ("à confirmer").
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
  // --- Anatomy primitives (Air Liquide) ------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border 1px
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. Targets ~40px medium controls with 0.75rem inline padding.
  // sm/lg follow the standard size scale ("à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Air Liquide typography: Montserrat (Alfa approximation) for interactive,
  // fields, labels and display. Button labels use a medium weight (500).
  typography: {
    control: { family: "'Montserrat', system-ui, sans-serif", size: "1rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Montserrat', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Montserrat', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are corporate blue #375F9B, not underlined at rest, underlined on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // brand controls dim disabled state to 0.5
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a high-contrast OUTLINE in the corporate blue.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: airLiquideColor.blue.primary, // #375F9B focus outline blue
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px grey border (#d5dce5)
  // and a 4px radius. `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: airLiquideColor.grey[0], // #ffffff
    underlineColor: airLiquideColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the brand blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23375F9B' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + slight radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: airLiquideColor.grey[50] // #f5f7fa
  },
  // Secondary button = OUTLINED in the brand "Unique Red": transparent fill,
  // red border + text, light red fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: airLiquideColor.red.main, // #D7001E stroke
    hoverBackground: airLiquideColor.red.light // #fbe0e4 light fill on hover
  },
  // Tabs / top-nav: active tab = bold blue label with a bottom blue underline.
  tabs: {
    activeText: airLiquideColor.blue.primary, // #375F9B
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
    text: airLiquideColor.blue.primary, // #375F9B link text
    activeBackground: airLiquideColor.blue.primary, // #375F9B filled active page
    activeText: airLiquideColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: airLiquideColor.blue.primary, // #375F9B
    text: airLiquideColor.grey[500], // #6b7785 trail text
    currentText: airLiquideColor.grey[800], // #1f2a3a current page
    separator: airLiquideColor.grey[500], // #6b7785
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
    text: airLiquideColor.grey[800], // #1f2a3a summary label
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
    neutralBackground: airLiquideColor.grey[50], // #f5f7fa
    neutralText: airLiquideColor.grey[800] // #1f2a3a
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
    infoBackground: airLiquideColor.blue.primary, // #375F9B
    infoText: airLiquideColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: airLiquideColor.grey[800] // #1f2a3a
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
    textColor: airLiquideColor.grey[800] // #1f2a3a
  }
} as const;

// --- semantic (Air Liquide-specific role mapping) --------------------------
const semantic = {
  surface: {
    default: airLiquideColor.grey[0], // white
    subtle: airLiquideColor.grey[50], // #f5f7fa background alt
    raised: airLiquideColor.grey[0], // white
    inverse: airLiquideColor.grey[800], // #1f2a3a dark slate inverse surface (à confirmer)
    overlay: "rgb(31 42 58 / 0.6)" // modal backdrop (brand slate tint)
  },
  text: {
    primary: airLiquideColor.grey[800], // #1f2a3a
    secondary: airLiquideColor.grey[500], // #6b7785
    muted: airLiquideColor.grey[600], // #5a6573
    inverse: airLiquideColor.grey[0], // white on dark / coloured surfaces
    link: airLiquideColor.blue.primary // #375F9B
  },
  border: {
    subtle: airLiquideColor.grey[200], // #d5dce5 (field stroke)
    strong: airLiquideColor.grey[500], // #6b7785
    interactive: airLiquideColor.blue.primary // #375F9B focus / interactive
  },
  action: {
    primary: airLiquideColor.blue.primary, // #375F9B primary button
    primaryHover: airLiquideColor.blue.hover, // #2c4d80 darker hover
    primaryText: airLiquideColor.grey[0], // white text on blue
    secondary: airLiquideColor.grey[50], // #f5f7fa secondary surface
    secondaryHover: airLiquideColor.grey[200], // #d5dce5
    secondaryText: airLiquideColor.blue.primary, // #375F9B
    danger: airLiquideColor.red.main // #D7001E brand red
  },
  feedback: {
    success: airLiquideColor.system.success,
    warning: airLiquideColor.system.warning,
    error: airLiquideColor.system.error,
    info: airLiquideColor.system.info
  },
  status: {
    pending: airLiquideColor.system.warning,
    processing: airLiquideColor.system.info,
    completed: airLiquideColor.system.success,
    failed: airLiquideColor.system.error
  },
  // Categorical data-vis palette built from the brand hues + complementary
  // tones. Air Liquide does not publish an 8-colour sequential scale, so this
  // is a coherent proposal (see MAPPING.md, "à confirmer").
  data: {
    category1: airLiquideColor.blue.primary, // #375F9B corporate blue
    category2: airLiquideColor.red.main, // #D7001E brand red
    category3: airLiquideColor.system.success, // #2e9e5b green
    category4: airLiquideColor.system.warning, // #e0820b amber
    category5: "#249DD9", // light blue (proposal)
    category6: "#00a0b4", // teal (proposal)
    category7: "#6f42c1", // purple (proposal)
    category8: airLiquideColor.blue.deep // #1f3a66 deep blue
  }
} as const;

/**
 * The Air Liquide theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Air Liquide-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Air Liquide brand reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const airLiquideTheme: TenantTheme = {
  id: "air-liquide",
  label: "Air Liquide",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default airLiquideTheme;
