import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * ENGIE brand theme for the Sentropic token structure.
 *
 * All values below are mapped from ENGIE's PUBLIC, TOKENISED "Fluid Design
 * System" (engie.design — foundations/colors, typography). We only reference
 * font *names* (Lato) here, never font binaries. Sources and exact provenance
 * are documented in MAPPING.md. Where the Fluid Design System has no publicly
 * extracted equivalent for a Sentropic role (e.g. the full neutral scale), the
 * closest derived value is used and the choice is noted "à confirmer" in
 * MAPPING.md.
 *
 * ENGIE colour reference (light theme, Fluid Design System):
 *   White (background default)        #ffffff   (neutral 0 / surface default)
 *   Grey light (background alt)        #f3f5f7   (Fluid neutral — derived, à confirmer)
 *   Field border default               #d4d9e0   (Fluid neutral — derived, à confirmer)
 *   Secondary text / muted grey        #6b7280   (Fluid neutral — derived, à confirmer)
 *   Dark grey (muted)                  #4b5563   (Fluid neutral — derived, à confirmer)
 *   Body / primary text                #1b2733   (Fluid neutral — derived, à confirmer)
 *   Darkest grey                       #0d1620   (Fluid neutral — derived, à confirmer)
 *   Blue Bolt (action / link)          #007ACD   (Fluid "Blue Bolt" / Blue 600 — primary action)
 *   Blue Bolt hover                    #0061a4   (derived darker blue — à confirmer)
 *   Deep blue                          #004c80   (derived deep blue — à confirmer)
 *   Blue Logo (logo / gradient only)   #00AAFF   (ENGIE "Blue Logo" — logotype & brand gradient)
 *   Success green                      #18ad5a   (Fluid feedback — derived, à confirmer)
 *   Warning amber (decorative)         #ff9d00   (Fluid feedback — derived, à confirmer)
 *   Error red                          #e6173c   (Fluid feedback — derived, à confirmer)
 *   Info blue                          #007ACD   (Fluid feedback — derived, à confirmer)
 */

// --- ENGIE raw colour palette (ENGIE Fluid Design System) ------------------
const engieColor = {
  // Primary blue — the ENGIE digital action / link family. "Blue Bolt" (Blue
  // 600) is the Fluid Design System action colour (buttons, links, CTAs).
  blue: {
    bolt: "#007ACD", // ENGIE "Blue Bolt" / Blue 600 — primary action (buttons, links, CTA)
    hover: "#0061a4", // derived darker blue for hover (à confirmer)
    deep: "#004c80", // derived deep blue (à confirmer)
    logo: "#00AAFF", // ENGIE "Blue Logo" — reserved for the logotype & brand gradient
    light: "#e5f5fc", // derived light blue tint (à confirmer)
    logoLight: "#e5f7ff", // derived (à confirmer)
    logoDark: "#0088cc" // derived (à confirmer)
  },
  // Neutral grey scale. ENGIE's Fluid neutrals are not extracted publicly as
  // exact hexes, so this scale is derived to match the Fluid look (à confirmer).
  grey: {
    0: "#ffffff", // neutral 0 / surface default
    50: "#f3f5f7", // background alt (derived — à confirmer)
    200: "#d4d9e0", // subtle border / field stroke (derived — à confirmer)
    500: "#6b7280", // secondary text (derived — à confirmer)
    600: "#4b5563", // muted text (derived — à confirmer)
    800: "#1b2733", // primary text / dark slate (derived — à confirmer)
    900: "#0d1620" // darkest (derived — à confirmer)
  },
  // System / status colours. Fluid feedback hues are derived here (à confirmer);
  // info reuses the Blue Bolt action colour, as in the Fluid Design System.
  system: {
    success: "#18ad5a", // Fluid feedback success (derived — à confirmer)
    warning: "#ff9d00", // Fluid feedback warning amber (derived — à confirmer)
    error: "#e6173c", // Fluid feedback error red (derived — à confirmer)
    info: "#007ACD" // Fluid feedback info = Blue Bolt
  }
} as const;

// --- foundation (ENGIE-specific values) ------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the ENGIE Blue Bolt action blue.
    blue: {
      10: engieColor.blue.light, // lightest blue tint
      60: engieColor.blue.bolt, // #007ACD Blue Bolt primary
      80: engieColor.blue.hover // #0061a4 darker interactive blue
    },
    // The Sentropic "cyan" accent slot carries ENGIE's "Blue Logo" #00AAFF —
    // the lighter blue of the brand gradient/logotype (logo/gradient only, NOT
    // an interactive colour; interactive UI uses Blue Bolt #007ACD).
    cyan: {
      10: engieColor.blue.logoLight, // light logo-blue tint
      50: engieColor.blue.logo, // #00AAFF "Blue Logo" gradient accent
      70: engieColor.blue.logoDark // darker logo blue
    },
    // Sentropic "slate" role family mapped onto the grey scale.
    slate: {
      0: engieColor.grey[0], // white
      10: engieColor.grey[50], // background alt
      20: engieColor.grey[200], // subtle borders / field stroke
      60: engieColor.grey[500], // secondary text
      80: engieColor.grey[800], // primary text
      90: engieColor.grey[900] // darkest
    },
    feedback: {
      success: engieColor.system.success,
      warning: engieColor.system.warning,
      error: engieColor.system.error,
      info: engieColor.system.info
    }
  },
  // ENGIE's Fluid Design System uses "Lato" for digital interfaces (the brand
  // typefaces Clan Pro / Right Grotesk are reserved for offline and forbidden in
  // digital). Display and body therefore both use Lato; mono is the system
  // stack. We reference the font *names* only, not the binaries.
  font: {
    sans: "'Lato', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Lato', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; the Fluid Design System uses a comparable scale).
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
  // ENGIE Fluid aesthetic is lightly rounded: controls/inputs carry a 4px
  // radius, cards a slightly larger 8px radius (Fluid surfaces — à confirmer).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.25rem", // 4px — button / input / tabs
    lg: "0.5rem", // 8px — cards
    pill: "999px" // tags / pills
  },
  // Light, neutral elevation tinted with the brand slate. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(27 39 51 / 0.10)",
    medium: "0 4px 12px rgb(27 39 51 / 0.14)",
    floating: "0 8px 24px rgb(27 39 51 / 0.18)"
  },
  // Motion durations are not strongly tokenised by the Fluid Design System
  // publicly; kept aligned with the Sentropic base ("à confirmer").
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
  // --- Anatomy primitives (ENGIE) ------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border 1px
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. ~40px medium controls with 0.75rem inline padding. sm/lg
  // follow the standard size scale ("à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // ENGIE typography: Lato for interactive/fields/labels and display titles.
  // Button labels use Lato (weight 500), no transform.
  typography: {
    control: { family: "'Lato', system-ui, sans-serif", size: "1rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Lato', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Lato', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are Blue Bolt #007ACD, not underlined at rest, underlined on hover.
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
  // FOCUS = a high-contrast OUTLINE in the Blue Bolt #007ACD (the Fluid focus
  // technique is a clear blue outline ring around the focused control).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: engieColor.blue.bolt, // #007ACD Blue Bolt focus outline
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px grey border (#d4d9e0)
  // and a 4px radius. `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: engieColor.grey[0], // #ffffff
    underlineColor: engieColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Blue Bolt with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23007ACD' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + slight radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: engieColor.grey[50] // #f3f5f7
  },
  // Secondary button = OUTLINED in Blue Bolt: transparent fill, blue border +
  // text, light blue fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: engieColor.blue.bolt, // #007ACD stroke
    hoverBackground: engieColor.blue.light // #e5f5fc light fill on hover
  },
  // Tabs / top-nav: active tab = bold blue label with a bottom blue underline.
  tabs: {
    activeText: engieColor.blue.bolt, // #007ACD
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
  // Pagination: borderless blue text links; active page = filled Blue Bolt.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: engieColor.blue.bolt, // #007ACD link text
    activeBackground: engieColor.blue.bolt, // #007ACD filled active page
    activeText: engieColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: engieColor.blue.bolt, // #007ACD
    text: engieColor.grey[500], // #6b7280 trail text
    currentText: engieColor.grey[800], // #1b2733 current page
    separator: engieColor.grey[500], // #6b7280
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
    text: engieColor.grey[800], // #1b2733 summary label
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
    neutralBackground: engieColor.grey[50], // #f3f5f7
    neutralText: engieColor.grey[800] // #1b2733
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
    infoBackground: engieColor.blue.bolt, // #007ACD
    infoText: engieColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: engieColor.grey[800] // #1b2733
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
    textColor: engieColor.grey[800] // #1b2733
  }
} as const;

// --- semantic (ENGIE-specific role mapping) --------------------------------
const semantic = {
  surface: {
    default: engieColor.grey[0], // white
    subtle: engieColor.grey[50], // #f3f5f7 background alt
    raised: engieColor.grey[0], // white
    inverse: engieColor.grey[800], // #1b2733 dark slate inverse surface (à confirmer)
    overlay: "rgb(27 39 51 / 0.6)" // modal backdrop (brand slate tint)
  },
  text: {
    primary: engieColor.grey[800], // #1b2733 (body text)
    secondary: engieColor.grey[500], // #6b7280
    muted: engieColor.grey[600], // #4b5563
    inverse: engieColor.grey[0], // white on dark / coloured surfaces
    link: engieColor.blue.bolt // #007ACD Blue Bolt
  },
  border: {
    subtle: engieColor.grey[200], // #d4d9e0 (field stroke)
    strong: engieColor.grey[500], // #6b7280
    interactive: engieColor.blue.bolt // #007ACD focus / interactive
  },
  action: {
    primary: engieColor.blue.bolt, // #007ACD Blue Bolt primary button
    primaryHover: engieColor.blue.hover, // #0061a4 darker hover (à confirmer)
    primaryText: engieColor.grey[0], // white text on blue
    secondary: engieColor.grey[50], // #f3f5f7 secondary surface
    secondaryHover: engieColor.grey[200], // #d4d9e0
    secondaryText: engieColor.blue.bolt, // #007ACD
    danger: engieColor.system.error // #e6173c error red
  },
  feedback: {
    success: engieColor.system.success,
    warning: engieColor.system.warning,
    error: engieColor.system.error,
    info: engieColor.system.info
  },
  status: {
    pending: engieColor.system.warning,
    processing: engieColor.system.info,
    completed: engieColor.system.success,
    failed: engieColor.system.error
  },
  // Categorical data-vis palette built from the brand hues. The Fluid Design
  // System does not publish an 8-colour sequential scale, so this is a coherent
  // proposal drawn from the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: engieColor.blue.bolt, // #007ACD Blue Bolt
    category2: engieColor.blue.logo, // #00AAFF Blue Logo
    category3: engieColor.system.success, // #18ad5a green
    category4: engieColor.system.warning, // #ff9d00 amber
    category5: engieColor.system.error, // #e6173c red
    category6: engieColor.blue.deep, // #004c80 deep blue
    category7: engieColor.grey[500], // #6b7280 grey
    category8: engieColor.blue.logoDark // #0088cc dark logo blue
  }
} as const;

/**
 * The ENGIE theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry ENGIE-specific values, and the `component`
 * layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the ENGIE brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const engieTheme: TenantTheme = {
  id: "engie",
  label: "ENGIE",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default engieTheme;
