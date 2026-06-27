import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Schneider Electric brand theme for the Sentropic token structure.
 *
 * Schneider Electric publishes a tokenised public design system ("Quartz",
 * quartz.se.com / GitHub org `quartzds`) whose signature is the "Life Green"
 * brand colour. This package is a MEASURED-CLONE mapping: the brand green
 * (#3DCD58, Quartz brand green / Emerald "Life Green") is read from the public
 * brand references, and we reference the brand font *name* (Nunito, the Quartz
 * `--qds-font-family-brand`) only — never font binaries. Sources and exact
 * provenance are documented in MAPPING.md. Where Quartz does not publish a
 * direct equivalent for a Sentropic role (the neutral greys, the green
 * hover/deep/light tints, the feedback hues), the closest derived value is used
 * and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Schneider Electric colour reference (light theme):
 *   White (background default)        #ffffff   (surface default)
 *   Grey light (background alt)        #f4f6f7   (neutral surface alt — derived)
 *   Field border subtle                #c8d0d4   (subtle border / field stroke — derived)
 *   Secondary text grey                #6b7780   (secondary text — derived)
 *   Muted grey                         #4d575e   (muted text — derived)
 *   Body / primary text (near-black)   #1a2326   (primary text / dark inverse — derived)
 *   Darkest slate                      #0f1518   (darkest — derived)
 *   Life Green (brand / action)        #3DCD58   (Quartz brand green / Emerald "Life Green")
 *   Life Green hover                   #2fb347   (derived darker green for hover — à confirmer)
 *   Deep green                         #1e7e34   (derived deep green for legible labels — à confirmer)
 *   Light green tint                   #e3f7e8   (derived light green tint — à confirmer)
 *   Success green                      #2e9e4f   (derived — à confirmer)
 *   Warning amber                      #f08c00   (derived — à confirmer)
 *   Error red                          #e2231a   (derived — à confirmer)
 *   Info blue                          #2e7dd1   (derived — à confirmer)
 */

// --- Schneider Electric raw colour palette ---------------------------------
const schneiderColor = {
  // Life Green — the Schneider signature brand colour (Quartz brand green /
  // Emerald "Life Green"). Used as the action / brand family.
  green: {
    primary: "#3DCD58", // Schneider "Life Green" — Quartz brand green (action / brand)
    hover: "#2fb347", // derived darker green for hover (à confirmer)
    deep: "#1e7e34", // derived deep green for legible green labels (à confirmer)
    light: "#e3f7e8" // derived light green tint (à confirmer)
  },
  // Neutral / dark slate scale. Quartz greys are not extracted publicly, so the
  // scale is a coherent derived neutral ramp (à confirmer).
  slate: {
    0: "#ffffff", // white / body background
    50: "#f4f6f7", // background alt
    200: "#c8d0d4", // subtle border / field stroke
    500: "#6b7780", // secondary text
    600: "#4d575e", // muted text
    800: "#1a2326", // primary text / dark inverse surface
    900: "#0f1518" // darkest
  },
  // System / status colours (derived — à confirmer).
  system: {
    success: "#2e9e4f", // derived success green
    warning: "#f08c00", // derived warning amber (AA on white)
    error: "#e2231a", // derived error red (destructive emphasis)
    info: "#2e7dd1" // derived info blue
  }
} as const;

// --- foundation (Schneider-Electric-specific values) -----------------------
const foundation = {
  color: {
    // Schneider Electric has no dominant brand BLUE; the Sentropic "blue" role
    // family (primary action / link / interactive) carries the Life Green —
    // the brand's colour of action.
    blue: {
      10: schneiderColor.green.light, // #e3f7e8 lightest green tint
      60: schneiderColor.green.primary, // #3DCD58 Life Green (primary)
      80: schneiderColor.green.hover // #2fb347 darker interactive green
    },
    // Schneider has no cyan accent; the Sentropic "cyan" accent slot carries a
    // deeper green accent drawn from the Life Green family (à confirmer).
    cyan: {
      10: schneiderColor.green.light, // light green tint (à confirmer)
      50: schneiderColor.green.deep, // #1e7e34 deep green accent (à confirmer)
      70: "#16a34a" // green accent (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the neutral scale.
    slate: {
      0: schneiderColor.slate[0], // white
      10: schneiderColor.slate[50], // background alt
      20: schneiderColor.slate[200], // subtle borders / field stroke
      60: schneiderColor.slate[500], // secondary text
      80: schneiderColor.slate[800], // primary text
      90: schneiderColor.slate[900] // darkest
    },
    feedback: {
      success: schneiderColor.system.success,
      warning: schneiderColor.system.warning,
      error: schneiderColor.system.error,
      info: schneiderColor.system.info
    }
  },
  // Schneider's Quartz design system ships "Nunito" as its brand typeface
  // (`--qds-font-family-brand`); we use it for both body/controls and display.
  // mono is the system stack. We reference the font *names* only, not binaries.
  font: {
    sans: "'Nunito', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Nunito', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; Quartz uses a comparable 4px-based scale).
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
  // Schneider / Quartz aesthetic is lightly rounded: controls/inputs carry a
  // 4px radius, cards a slightly larger 8px radius (à confirmer).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.25rem", // 4px — button / input / tabs
    lg: "0.5rem", // 8px — cards
    pill: "999px" // tags / pills
  },
  // Light, neutral elevation tinted with the brand slate. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(26 35 38 / 0.10)",
    medium: "0 4px 12px rgb(26 35 38 / 0.14)",
    floating: "0 8px 24px rgb(26 35 38 / 0.18)"
  },
  // Motion durations are not strongly tokenised by Quartz publicly; kept aligned
  // with the Sentropic base ("à confirmer").
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
  // --- Anatomy primitives (Schneider Electric) -----------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border 1px
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. ~38-40px medium controls with 0.75rem inline padding; sm/lg
  // follow the standard size scale ("à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Schneider typography: Nunito for interactive/fields/labels and display.
  // Button labels use a medium weight (500), no transform.
  typography: {
    control: { family: "'Nunito', system-ui, sans-serif", size: "1rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Nunito', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Nunito', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are the deep green #1e7e34 (legible green), not underlined at
    // rest, underlined on hover.
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
  // FOCUS = a high-contrast OUTLINE in the Life Green.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: schneiderColor.green.primary, // #3DCD58 Life Green focus outline
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px grey border (#c8d0d4)
  // and a 4px radius. `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: schneiderColor.slate[0], // #ffffff
    underlineColor: schneiderColor.slate[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the Life Green with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%233DCD58' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + slight radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: schneiderColor.slate[50] // #f4f6f7
  },
  // Secondary button = OUTLINED in the Life Green: transparent fill, green
  // border + text, light green fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: schneiderColor.green.primary, // #3DCD58 stroke
    hoverBackground: schneiderColor.green.light // #e3f7e8 light fill on hover
  },
  // Tabs / top-nav: active tab = deep-green label (legible) with a bottom green
  // underline.
  tabs: {
    activeText: schneiderColor.green.deep, // #1e7e34 legible deep green label
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
  // Pagination: borderless deep-green text links; active page = filled Life Green
  // with dark text for AA contrast.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: schneiderColor.green.deep, // #1e7e34 link text
    activeBackground: schneiderColor.green.primary, // #3DCD58 filled active page
    activeText: "#0a160d", // dark text on the Life Green for AA contrast (à confirmer)
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: deep-green links, dark current page, grey separators.
  breadcrumb: {
    linkText: schneiderColor.green.deep, // #1e7e34
    text: schneiderColor.slate[500], // #6b7780 trail text
    currentText: schneiderColor.slate[800], // #1a2326 current page
    separator: schneiderColor.slate[500], // #6b7780
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
    text: schneiderColor.slate[800], // #1a2326 summary label
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
    neutralBackground: schneiderColor.slate[50], // #f4f6f7
    neutralText: schneiderColor.slate[800] // #1a2326
  },
  // Badge: a 4px-radius filled badge in the Life Green with dark text.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: schneiderColor.green.primary, // #3DCD58
    infoText: "#0a160d" // dark text on Life Green for AA contrast (à confirmer)
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: schneiderColor.slate[800] // #1a2326
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
    textColor: schneiderColor.slate[800] // #1a2326
  }
} as const;

// --- semantic (Schneider-Electric-specific role mapping) -------------------
const semantic = {
  surface: {
    default: schneiderColor.slate[0], // white
    subtle: schneiderColor.slate[50], // #f4f6f7 background alt
    raised: schneiderColor.slate[0], // white
    inverse: schneiderColor.slate[800], // #1a2326 dark slate inverse surface
    overlay: "rgb(26 35 38 / 0.6)" // modal backdrop (brand slate tint)
  },
  text: {
    primary: schneiderColor.slate[800], // #1a2326 (body color)
    secondary: schneiderColor.slate[500], // #6b7780 (secondary)
    muted: schneiderColor.slate[600], // #4d575e (muted)
    inverse: schneiderColor.slate[0], // white on dark / coloured surfaces
    link: schneiderColor.green.deep // #1e7e34 legible green link
  },
  border: {
    subtle: schneiderColor.slate[200], // #c8d0d4 (field stroke)
    strong: schneiderColor.slate[500], // #6b7780
    interactive: schneiderColor.green.primary // #3DCD58 Life Green interactive
  },
  action: {
    primary: schneiderColor.green.primary, // #3DCD58 Life Green primary
    primaryHover: schneiderColor.green.hover, // #2fb347 darker hover
    primaryText: "#0a160d", // dark text on the Life Green for AA contrast — Schneider uses dark text on Life Green (à confirmer)
    secondary: schneiderColor.slate[50], // #f4f6f7 secondary surface
    secondaryHover: schneiderColor.slate[200], // #c8d0d4
    secondaryText: schneiderColor.green.deep, // #1e7e34
    danger: schneiderColor.system.error // #e2231a error red
  },
  feedback: {
    success: schneiderColor.system.success,
    warning: schneiderColor.system.warning,
    error: schneiderColor.system.error,
    info: schneiderColor.system.info
  },
  status: {
    pending: schneiderColor.system.warning,
    processing: schneiderColor.system.info,
    completed: schneiderColor.system.success,
    failed: schneiderColor.system.error
  },
  // Categorical data-vis palette built from the brand hues. Quartz does not
  // publish an 8-colour sequential scale, so this is a coherent proposal drawn
  // from the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: schneiderColor.green.primary, // #3DCD58 Life Green
    category2: schneiderColor.slate[800], // #1a2326 dark slate
    category3: schneiderColor.system.info, // #2e7dd1 info blue
    category4: schneiderColor.system.warning, // #f08c00 amber
    category5: schneiderColor.system.error, // #e2231a red
    category6: "#16a34a", // green accent
    category7: schneiderColor.slate[500], // #6b7780 grey
    category8: schneiderColor.green.deep // #1e7e34 deep green
  }
} as const;

/**
 * The Schneider Electric theme as a Sentropic `TenantTheme`. The `tokens` tree
 * is complete: `foundation` and `semantic` carry Schneider-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Life Green brand reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const schneiderElectricTheme: TenantTheme = {
  id: "schneider-electric",
  label: "Schneider Electric",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default schneiderElectricTheme;
