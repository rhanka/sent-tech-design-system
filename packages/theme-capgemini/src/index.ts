import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Capgemini brand theme for the Sentropic token structure.
 *
 * All brand-anchored values below are mapped from Capgemini's PUBLIC brand
 * palette (the two official blues) and Capgemini's documented web typeface
 * (Ubuntu). We only reference font *names* here, never font binaries. Sources
 * and exact provenance are documented in MAPPING.md. Capgemini does not publish
 * an open, tokenised design system (unlike ENGIE's Fluid), so every value that
 * is NOT one of the two official brand blues or the documented typeface is a
 * faithful derivation and is flagged "à confirmer" in MAPPING.md.
 *
 * Capgemini colour reference (light theme):
 *   White (background default)        #ffffff   (neutral 0 / surface default)
 *   Grey light (background alt)        #f2f6f9   (blue-tinted neutral — derived, à confirmer)
 *   Field border default               #d0d9e0   (blue-tinted neutral — derived, à confirmer)
 *   Secondary text / muted grey        #5f6b75   (blue-tinted neutral — derived, à confirmer)
 *   Dark grey (muted)                  #44505a   (blue-tinted neutral — derived, à confirmer)
 *   Body / primary text                #1c2a35   (dark blue-slate — derived, à confirmer)
 *   Darkest grey                       #0c1620   (dark blue-slate — derived, à confirmer)
 *   Capgemini Blue (action / link)     #0070AD   (official "Capgemini Blue" / Pantone 7461 C — primary action)
 *   Capgemini Blue hover               #005a8c   (derived darker blue — à confirmer)
 *   Deep blue                          #004a73   (derived deep blue — à confirmer)
 *   Vibrant Blue (accent / spark)      #17ABDA   (official "Vibrant Blue" / Pantone 2191 C — accent, logotype spark)
 *   Success green                      #2e9e5b   (derived feedback — à confirmer)
 *   Warning amber                      #f0a500   (derived feedback — à confirmer)
 *   Error red                          #d6273c   (derived feedback — à confirmer)
 *   Info blue                          #0070AD   (feedback info = Capgemini Blue)
 */

// --- Capgemini raw colour palette ------------------------------------------
const capgeminiColor = {
  // Brand blues. Capgemini's identity is built on TWO official blues: the deep
  // "Capgemini Blue" (#0070AD — dependability, heritage) used for interactive
  // UI, and the lighter "Vibrant Blue" (#17ABDA — energy, free-thinking) used
  // as accent / the logotype spark.
  blue: {
    capgemini: "#0070AD", // official "Capgemini Blue" / Pantone 7461 C — primary action (buttons, links, CTA)
    hover: "#005a8c", // derived darker blue for hover (à confirmer)
    deep: "#004a73", // derived deep blue (à confirmer)
    light: "#e6f1f7", // derived light blue tint (à confirmer)
    vibrant: "#17ABDA", // official "Vibrant Blue" / Pantone 2191 C — accent / logotype spark
    vibrantLight: "#e7f6fb", // derived light vibrant tint (à confirmer)
    vibrantDark: "#1296be" // derived darker vibrant blue (à confirmer)
  },
  // Neutral grey scale. Capgemini does not publish an exact neutral scale, so
  // this blue-tinted scale is derived to sit naturally beside the brand blues
  // (à confirmer).
  grey: {
    0: "#ffffff", // neutral 0 / surface default
    50: "#f2f6f9", // background alt (derived — à confirmer)
    200: "#d0d9e0", // subtle border / field stroke (derived — à confirmer)
    500: "#5f6b75", // secondary text (derived — à confirmer)
    600: "#44505a", // muted text (derived — à confirmer)
    800: "#1c2a35", // primary text / dark blue-slate (derived — à confirmer)
    900: "#0c1620" // darkest (derived — à confirmer)
  },
  // System / status colours. Capgemini does not publish a feedback palette;
  // these hues are derived (à confirmer); info reuses Capgemini Blue.
  system: {
    success: "#2e9e5b", // feedback success (derived — à confirmer)
    warning: "#f0a500", // feedback warning amber (derived — à confirmer)
    error: "#d6273c", // feedback error red (derived — à confirmer)
    info: "#0070AD" // feedback info = Capgemini Blue
  }
} as const;

// --- foundation (Capgemini-specific values) --------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the deep Capgemini Blue action blue.
    blue: {
      10: capgeminiColor.blue.light, // lightest blue tint
      60: capgeminiColor.blue.capgemini, // #0070AD Capgemini Blue primary
      80: capgeminiColor.blue.hover // #005a8c darker interactive blue
    },
    // The Sentropic "cyan" accent slot carries Capgemini's "Vibrant Blue"
    // #17ABDA — the energetic light blue of the logotype spark / brand accent.
    cyan: {
      10: capgeminiColor.blue.vibrantLight, // light vibrant tint
      50: capgeminiColor.blue.vibrant, // #17ABDA "Vibrant Blue" accent
      70: capgeminiColor.blue.vibrantDark // darker vibrant blue
    },
    // Sentropic "slate" role family mapped onto the grey scale.
    slate: {
      0: capgeminiColor.grey[0], // white
      10: capgeminiColor.grey[50], // background alt
      20: capgeminiColor.grey[200], // subtle borders / field stroke
      60: capgeminiColor.grey[500], // secondary text
      80: capgeminiColor.grey[800], // primary text
      90: capgeminiColor.grey[900] // darkest
    },
    feedback: {
      success: capgeminiColor.system.success,
      warning: capgeminiColor.system.warning,
      error: capgeminiColor.system.error,
      info: capgeminiColor.system.info
    }
  },
  // Capgemini's web typeface is "Ubuntu" (its signature digital sans). Display
  // and body therefore both use Ubuntu; mono is the system stack. We reference
  // the font *names* only, not the binaries — Ubuntu is a named family, never
  // network-loaded by this package.
  font: {
    sans: "'Ubuntu', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Ubuntu', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
  // Capgemini's web aesthetic is lightly rounded: controls/inputs carry a 4px
  // radius, cards a slightly larger 8px radius (à confirmer). Some marketing
  // CTAs render as pills — `radius.pill` is available for those.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.25rem", // 4px — button / input / tabs
    lg: "0.5rem", // 8px — cards
    pill: "999px" // pill CTAs / tags
  },
  // Light, neutral elevation tinted with the brand slate. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(28 42 53 / 0.10)",
    medium: "0 4px 12px rgb(28 42 53 / 0.14)",
    floating: "0 8px 24px rgb(28 42 53 / 0.18)"
  },
  // Motion durations are not tokenised by Capgemini publicly; kept aligned with
  // the Sentropic base ("à confirmer").
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
  // --- Anatomy primitives (Capgemini) --------------------------------------
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
  // Capgemini typography: Ubuntu for interactive/fields/labels and display
  // titles. Button labels use Ubuntu (weight 500), no transform.
  typography: {
    control: { family: "'Ubuntu', system-ui, sans-serif", size: "1rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Ubuntu', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Ubuntu', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are Capgemini Blue #0070AD, not underlined at rest, underlined on hover.
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
  // FOCUS = a high-contrast OUTLINE in Capgemini Blue #0070AD (a clear blue
  // outline ring around the focused control).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: capgeminiColor.blue.capgemini, // #0070AD Capgemini Blue focus outline
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px grey border (#d0d9e0)
  // and a 4px radius. `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: capgeminiColor.grey[0], // #ffffff
    underlineColor: capgeminiColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Capgemini Blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230070AD' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + slight radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: capgeminiColor.grey[50] // #f2f6f9
  },
  // Secondary button = OUTLINED in Capgemini Blue: transparent fill, blue border +
  // text, light blue fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: capgeminiColor.blue.capgemini, // #0070AD stroke
    hoverBackground: capgeminiColor.blue.light // #e6f1f7 light fill on hover
  },
  // Tabs / top-nav: active tab = bold blue label with a bottom blue underline.
  tabs: {
    activeText: capgeminiColor.blue.capgemini, // #0070AD
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
  // Pagination: borderless blue text links; active page = filled Capgemini Blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: capgeminiColor.blue.capgemini, // #0070AD link text
    activeBackground: capgeminiColor.blue.capgemini, // #0070AD filled active page
    activeText: capgeminiColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: capgeminiColor.blue.capgemini, // #0070AD
    text: capgeminiColor.grey[500], // #5f6b75 trail text
    currentText: capgeminiColor.grey[800], // #1c2a35 current page
    separator: capgeminiColor.grey[500], // #5f6b75
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
    text: capgeminiColor.grey[800], // #1c2a35 summary label
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
    neutralBackground: capgeminiColor.grey[50], // #f2f6f9
    neutralText: capgeminiColor.grey[800] // #1c2a35
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
    infoBackground: capgeminiColor.blue.capgemini, // #0070AD
    infoText: capgeminiColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: capgeminiColor.grey[800] // #1c2a35
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
    textColor: capgeminiColor.grey[800] // #1c2a35
  }
} as const;

// --- semantic (Capgemini-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: capgeminiColor.grey[0], // white
    subtle: capgeminiColor.grey[50], // #f2f6f9 background alt
    raised: capgeminiColor.grey[0], // white
    inverse: capgeminiColor.grey[800], // #1c2a35 dark blue-slate inverse surface (à confirmer)
    overlay: "rgb(28 42 53 / 0.6)" // modal backdrop (brand slate tint)
  },
  text: {
    primary: capgeminiColor.grey[800], // #1c2a35 (body text)
    secondary: capgeminiColor.grey[500], // #5f6b75
    muted: capgeminiColor.grey[600], // #44505a
    inverse: capgeminiColor.grey[0], // white on dark / coloured surfaces
    link: capgeminiColor.blue.capgemini // #0070AD Capgemini Blue
  },
  border: {
    subtle: capgeminiColor.grey[200], // #d0d9e0 (field stroke)
    strong: capgeminiColor.grey[500], // #5f6b75
    interactive: capgeminiColor.blue.capgemini // #0070AD focus / interactive
  },
  action: {
    primary: capgeminiColor.blue.capgemini, // #0070AD Capgemini Blue primary button
    primaryHover: capgeminiColor.blue.hover, // #005a8c darker hover (à confirmer)
    primaryText: capgeminiColor.grey[0], // white text on blue
    secondary: capgeminiColor.grey[50], // #f2f6f9 secondary surface
    secondaryHover: capgeminiColor.grey[200], // #d0d9e0
    secondaryText: capgeminiColor.blue.capgemini, // #0070AD
    danger: capgeminiColor.system.error // #d6273c error red
  },
  feedback: {
    success: capgeminiColor.system.success,
    warning: capgeminiColor.system.warning,
    error: capgeminiColor.system.error,
    info: capgeminiColor.system.info
  },
  status: {
    pending: capgeminiColor.system.warning,
    processing: capgeminiColor.system.info,
    completed: capgeminiColor.system.success,
    failed: capgeminiColor.system.error
  },
  // Categorical data-vis palette built from the brand hues. Capgemini does not
  // publish an 8-colour sequential scale, so this is a coherent proposal drawn
  // from the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: capgeminiColor.blue.capgemini, // #0070AD Capgemini Blue
    category2: capgeminiColor.blue.vibrant, // #17ABDA Vibrant Blue
    category3: capgeminiColor.system.success, // #2e9e5b green
    category4: capgeminiColor.system.warning, // #f0a500 amber
    category5: capgeminiColor.system.error, // #d6273c red
    category6: capgeminiColor.blue.deep, // #004a73 deep blue
    category7: capgeminiColor.grey[500], // #5f6b75 grey
    category8: capgeminiColor.blue.vibrantDark // #1296be dark vibrant blue
  }
} as const;

/**
 * The Capgemini theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Capgemini-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Capgemini brand reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const capgeminiTheme: TenantTheme = {
  id: "capgemini",
  label: "Capgemini",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default capgeminiTheme;
