import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Government of Canada Design System (GC Design System / GCDS) theme for the
 * Sentropic token structure.
 *
 * All values below are taken from the PUBLIC GC Design System (open source
 * design tokens `--gcds-*`). We only reference the font *names* (Lato, Noto
 * Sans) here, never font binaries. Sources are documented in MAPPING.md. Where
 * GCDS has no direct equivalent for a Sentropic role, the closest GCDS token is
 * used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * GCDS colour reference (light theme):
 *   White (background default)        #ffffff   (--gcds-bg-white / --gcds-text-light)
 *   Grey light (background alt)       #f2f2f2   (--gcds-bg-light, grey-50)
 *   Grey border default               #8c8c8c   (--gcds-border-default)
 *   Text secondary                    #595959   (--gcds-text-secondary)
 *   Text primary                      #333333   (--gcds-text-primary / --gcds-bg-dark)
 *   Blue 700 (action / link)          #1f497a   (--gcds-color-blue-700 / --gcds-link-default)
 *   Blue muted (FIP / inverse bg)     #26374a   (--gcds-color-blue-muted / --gcds-bg-primary)
 *   Blue hover (interactive / focus)  #1354ec   (--gcds-link-hover)
 *   Blue visited                      #4b248f   (--gcds-link-visited)
 *   Danger / red                      #b3192e   (--gcds-danger-text/border/background)
 *   Green 700 (success)               #1f7a40   (--gcds-color-green-700)
 */

// --- GCDS raw colour palette (public design tokens) ------------------------
const canadaColor = {
  // Federal blue — the brand / action family.
  blue: {
    muted: "#26374a", // --gcds-color-blue-muted / --gcds-bg-primary (FIP dark blue: header/footer/inverse)
    700: "#1f497a", // --gcds-color-blue-700 / --gcds-link-default (primary action + link)
    hover: "#1354ec", // --gcds-link-hover (bright interactive blue / focus ring)
    light: "#e1e8f0", // light blue tint for low-emphasis surfaces (derived — à confirmer)
    visited: "#4b248f" // --gcds-link-visited (purple)
  },
  // GC red — decorative (flag) / danger accent.
  red: {
    main: "#b3192e", // --gcds-danger-* (text / border / background)
    light: "#f3e1e4", // light red tint (derived — à confirmer)
    dark: "#8d1424" // darker red for hover/active (derived — à confirmer)
  },
  // Neutral grey scale (GCDS greyscale).
  grey: {
    0: "#ffffff", // --gcds-bg-white / --gcds-text-light
    50: "#f2f2f2", // --gcds-bg-light (grey-50)
    200: "#e0e0e0", // subtle border tint (derived — à confirmer)
    500: "#8c8c8c", // --gcds-border-default
    600: "#595959", // --gcds-text-secondary
    800: "#333333", // --gcds-text-primary / --gcds-bg-dark
    900: "#1a1a1a" // grey-900 (darkest)
  },
  // System / status colours. GCDS publishes danger + green; warning/info are
  // darkened GC-flavoured values picked to keep WCAG AA on white (à confirmer).
  system: {
    success: "#1f7a40", // --gcds-color-green-700
    error: "#b3192e", // --gcds-danger
    warning: "#b35900", // GC amber, darkened for AA on white
    info: "#1f497a" // GC blue (info notice)
  }
} as const;

// --- foundation (GCDS-specific values) -------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the federal blue.
    blue: {
      10: canadaColor.blue.light, // lightest blue tint
      60: canadaColor.blue[700], // Blue 700 (primary)
      80: canadaColor.blue.muted // darker interactive / FIP blue
    },
    // GCDS has no cyan; the closest accent is the GC red, so the Sentropic
    // "cyan" accent slot is mapped to the GC red family.
    cyan: {
      10: canadaColor.red.light, // light red tint
      50: canadaColor.red.main, // GC red accent
      70: canadaColor.red.dark // darker red
    },
    // Sentropic "slate" role family mapped onto the GCDS grey scale.
    slate: {
      0: canadaColor.grey[0], // white
      10: canadaColor.grey[50], // background alt
      20: canadaColor.grey[200], // subtle borders / contrast background
      60: canadaColor.grey[600], // secondary text
      80: canadaColor.grey[800], // primary text
      90: canadaColor.grey[900] // darkest
    },
    feedback: {
      success: canadaColor.system.success,
      warning: canadaColor.system.warning,
      error: canadaColor.system.error,
      info: canadaColor.system.info
    }
  },
  // GCDS ships "Lato" for headings and "Noto Sans" for body; "Noto Sans Mono"
  // for code. We reference the font *names* only, not the binaries.
  font: {
    sans: "'Noto Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Lato', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Noto Sans Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; GCDS uses a comparable 4px-based scale).
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
  // GCDS aesthetic is lightly rounded: controls/cards carry a 4px radius.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.25rem", // 4px — button / input / tabs
    lg: "0.25rem", // 4px — cards
    pill: "999px" // tags / pills
  },
  // GCDS uses light, neutral elevation (grey-tinted). Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(51 51 51 / 0.10)",
    medium: "0 4px 12px rgb(51 51 51 / 0.14)",
    floating: "0 8px 24px rgb(51 51 51 / 0.18)"
  },
  // Motion durations are not strongly tokenised by GCDS publicly; kept aligned
  // with the Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not GCDS-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (GCDS) -------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // GCDS control density. GC buttons target a 44px (md) touch height with
  // generous horizontal padding; sm/lg follow the GC size scale.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // GCDS typography: Lato for interactive/labels, Noto Sans for body/fields.
  typography: {
    control: { family: "'Lato', system-ui, sans-serif", size: "1rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Noto Sans', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Lato', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // GCDS links are underlined; hover thickens the underline.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "0.08em", decorationOffset: "0.15em",
      textDecorationHover: "underline", decorationThicknessHover: "0.14em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.55", // GCDS dims disabled controls
  transition: { property: "background-color, border-color, color, outline-color", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // GCDS FOCUS = a thick high-contrast OUTLINE in the focus blue.
  focus: {
    strategy: "outline",
    width: "3px",
    offset: "1px",
    color: canadaColor.blue.hover, // #1354ec GC focus blue
    inset: "0"
  },
  // GCDS form fields are BOXED (outline): a white fill with a 1px grey border
  // and a 4px radius (not a filled-underline). `style: "outline"` makes the
  // builder draw four equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: canadaColor.grey[0], // #ffffff
    underlineColor: canadaColor.grey[500], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in GC blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231f497a' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // GCDS cards: a 1px grey border + slight radius, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: canadaColor.grey[50] // #f2f2f2
  },
  // GCDS secondary button = OUTLINED (transparent fill, blue border + text,
  // light blue fill on hover).
  buttonSecondary: {
    background: "transparent",
    border: canadaColor.blue[700], // #1f497a stroke
    hoverBackground: canadaColor.blue.light // #e1e8f0 light fill on hover
  },
  // GCDS tabs / top-nav: active tab has a BOTTOM blue underline (border mode),
  // blue bold label, transparent fill.
  tabs: {
    activeText: canadaColor.blue[700], // #1f497a
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // GC underline sits on the bottom edge
    indicatorMode: "border" // a real bottom border (not a box-shadow filet)
  },
  // GCDS pagination: borderless blue text links; active page = filled blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: canadaColor.blue[700], // #1f497a link text
    activeBackground: canadaColor.blue[700], // #1f497a filled active page
    activeText: canadaColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // GCDS breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: canadaColor.blue[700], // #1f497a
    text: canadaColor.grey[600], // #595959 trail text
    currentText: canadaColor.grey[800], // #333333 current page
    separator: canadaColor.grey[500], // #8c8c8c
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700" // current page is emphasised
  },
  // GCDS notice / alert: a coloured LEFT accent filet on a transparent box.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0", // left border collapses (filet instead)
    filetWidth: "0.25rem", // 4px ::before accent bar
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // GCDS details: a dark bold summary trigger.
  accordion: {
    text: canadaColor.grey[800], // #333333 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700", // GC summary is bold
    lineHeight: "1.5rem" // 24px
  },
  // GCDS tag: a small 4px-radius grey chip.
  tag: {
    radius: "4px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: canadaColor.grey[50], // #f2f2f2
    neutralText: canadaColor.grey[800] // #333333
  },
  // GCDS badge: a 4px-radius filled badge.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: canadaColor.blue[700], // #1f497a
    infoText: canadaColor.grey[0] // white
  },
  // GCDS checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: canadaColor.grey[800] // #333333
  },
  // GCDS search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // GCDS toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: canadaColor.grey[800] // #333333
  }
} as const;

// --- semantic (GCDS-specific role mapping) ---------------------------------
const semantic = {
  surface: {
    default: canadaColor.grey[0], // white
    subtle: canadaColor.grey[50], // #f2f2f2 background alt
    raised: canadaColor.grey[0], // white
    inverse: canadaColor.blue.muted, // #26374a FIP dark blue inverse surface
    overlay: "rgb(38 55 74 / 0.6)" // modal backdrop (FIP blue tint)
  },
  text: {
    primary: canadaColor.grey[800], // #333333 (--gcds-text-primary)
    secondary: canadaColor.grey[600], // #595959 (--gcds-text-secondary)
    muted: canadaColor.grey[500], // #8c8c8c
    inverse: canadaColor.grey[0], // white on dark / coloured surfaces
    link: canadaColor.blue[700] // #1f497a (--gcds-link-default)
  },
  border: {
    subtle: canadaColor.grey[200], // #e0e0e0
    strong: canadaColor.grey[500], // #8c8c8c (--gcds-border-default)
    interactive: canadaColor.blue[700] // #1f497a focus / interactive
  },
  action: {
    primary: canadaColor.blue[700], // #1f497a primary button
    primaryHover: canadaColor.blue.muted, // #26374a darker hover
    primaryText: canadaColor.grey[0], // white text on blue
    secondary: canadaColor.grey[50], // #f2f2f2 secondary surface
    secondaryHover: canadaColor.grey[200], // #e0e0e0
    secondaryText: canadaColor.blue[700], // #1f497a
    danger: canadaColor.system.error // #b3192e
  },
  feedback: {
    success: canadaColor.system.success,
    warning: canadaColor.system.warning,
    error: canadaColor.system.error,
    info: canadaColor.system.info
  },
  status: {
    pending: canadaColor.system.warning,
    processing: canadaColor.system.info,
    completed: canadaColor.system.success,
    failed: canadaColor.system.error
  },
  // Categorical data-vis palette built from the GC brand hues. GCDS does not
  // publish an 8-colour sequential scale, so this is a coherent proposal drawn
  // from the GC palette (see MAPPING.md, "à confirmer").
  data: {
    category1: canadaColor.blue[700], // federal blue
    category2: canadaColor.red.main, // GC red
    category3: canadaColor.system.success, // green
    category4: canadaColor.blue.muted, // FIP dark blue
    category5: canadaColor.blue.visited, // purple
    category6: canadaColor.blue.hover, // bright blue
    category7: canadaColor.grey[600], // grey
    category8: canadaColor.system.warning // amber
  }
} as const;

/**
 * The GC Design System theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry GCDS-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the GC brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const canadaTheme: TenantTheme = {
  id: "canada",
  label: "Government of Canada",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default canadaTheme;
