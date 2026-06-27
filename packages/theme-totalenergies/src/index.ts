import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * TotalEnergies brand theme for the Sentropic token structure.
 *
 * All values below are MEASURED from the PUBLIC TotalEnergies corporate site
 * (totalenergies.com) production CSS (`theme=totalenergies_com`). We only
 * reference the font *names* (Nunito, Roboto) here, never font binaries.
 * Sources and exact provenance are documented in MAPPING.md. Where the brand
 * site has no direct equivalent for a Sentropic role, the closest measured
 * value (or a derived tint) is used and the choice is noted "à confirmer" in
 * MAPPING.md.
 *
 * TotalEnergies colour reference (light theme, measured on the live CSS):
 *   White (background default)        #ffffff   (--white / body background-color)
 *   Grey light (background alt)        #f8f9fa   (--light)
 *   Field border default               #ced4da   (.form-control border)
 *   Secondary text / muted grey        #6c757d   (--secondary / --gray)
 *   Dark grey (muted)                  #707173   (--dark)
 *   Body / primary text                #374649   (body color)
 *   Darkest grey                       #343a40   (--gray-dark)
 *   Primary blue (action / link)       #285AFF   (--primary / --blue / a color / .button--primary bg)
 *   Primary blue hover                 #0038f4   (.button--primary:hover background-color, measured)
 *   Focus outline blue                 #0d59b9   (outline:solid #0d59b9 0.2rem)
 *   Deep focus blue                    #004495   (focus box-shadow)
 *   Brand red (titles / red CTA)       #E70000   (.red-title / .cta-button[data-cta-type=red] bg / primary focus border)
 *   Success green                      #73b355   (--success / --green)
 *   Warning yellow (decorative)        #ffdc00   (--warning / --yellow)
 *   Orange                             #db7e04   (--orange)
 *   Info teal                          #17a2b8   (--info / --cyan)
 *   Purple                             #6f42c1   (--purple)
 */

// --- TotalEnergies raw colour palette (measured on the live CSS) -----------
const totalenergiesColor = {
  // Primary blue — the brand action / link family (.button--primary, links).
  blue: {
    primary: "#285AFF", // --primary / --blue / a{color} / .button--primary background
    hover: "#0038f4", // .button--primary:hover background-color rgb(0,56.7,244) (measured)
    focus: "#0d59b9", // outline:solid #0d59b9 0.2rem (focus ring colour)
    deep: "#004495", // focus box-shadow deep blue
    light: "#e3e9ff" // light blue tint for low-emphasis surfaces (derived — à confirmer)
  },
  // TotalEnergies red — the iconic brand accent (red titles, red CTA buttons,
  // primary-button focus border). Used heavily as a TEXT/title and accent hue.
  red: {
    main: "#E70000", // .red-title / .strong-red / .cta-button[data-cta-type=red] background / focus border
    light: "#fbe0e0", // light red tint (derived — à confirmer)
    dark: "#b80000" // darker red for hover/active (derived — à confirmer)
  },
  // Neutral grey scale (measured Bootstrap-derived greys on the live theme).
  grey: {
    0: "#ffffff", // --white / body background
    50: "#f8f9fa", // --light (background alt)
    200: "#ced4da", // .form-control border (subtle border)
    500: "#6c757d", // --secondary / --gray (secondary text)
    600: "#707173", // --dark (muted text)
    800: "#374649", // body color (primary text)
    900: "#343a40" // --gray-dark (darkest)
  },
  // System / status colours (measured utility tokens). The warning role uses
  // the measured --orange (AA-legible on white) rather than the #ffdc00 yellow,
  // which is decorative only; see MAPPING.md "à confirmer".
  system: {
    success: "#73b355", // --success / --green
    error: "#E70000", // brand red used for destructive / error emphasis
    warning: "#db7e04", // --orange (darker than the #ffdc00 yellow, AA on white)
    info: "#17a2b8" // --info / --cyan
  }
} as const;

// --- foundation (TotalEnergies-specific values) ----------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the TotalEnergies primary blue.
    blue: {
      10: totalenergiesColor.blue.light, // lightest blue tint
      60: totalenergiesColor.blue.primary, // #285AFF primary
      80: totalenergiesColor.blue.hover // #0038f4 darker interactive blue
    },
    // TotalEnergies has no dedicated cyan accent; the closest brand accent is
    // the iconic red, so the Sentropic "cyan" accent slot is mapped to the red.
    cyan: {
      10: totalenergiesColor.red.light, // light red tint
      50: totalenergiesColor.red.main, // #E70000 brand red accent
      70: totalenergiesColor.red.dark // darker red
    },
    // Sentropic "slate" role family mapped onto the grey scale.
    slate: {
      0: totalenergiesColor.grey[0], // white
      10: totalenergiesColor.grey[50], // background alt
      20: totalenergiesColor.grey[200], // subtle borders / field stroke
      60: totalenergiesColor.grey[500], // secondary text
      80: totalenergiesColor.grey[800], // primary text
      90: totalenergiesColor.grey[900] // darkest
    },
    feedback: {
      success: totalenergiesColor.system.success,
      warning: totalenergiesColor.system.warning,
      error: totalenergiesColor.system.error,
      info: totalenergiesColor.system.info
    }
  },
  // TotalEnergies ships "Nunito" for display titles (.page-title, .title-level-*)
  // and "Roboto" for body/controls; mono is the system stack (--font-family-
  // monospace). We reference the font *names* only, not the binaries.
  font: {
    sans: "'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Nunito', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; the brand site uses a comparable 4px-based scale).
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
  // TotalEnergies aesthetic is lightly rounded: controls/inputs/cards carry a
  // 4px radius (.form-control / .btn border-radius 0.25rem — measured).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.25rem", // 4px — button / input / tabs
    lg: "0.25rem", // 4px — cards
    pill: "999px" // tags / pills
  },
  // Light, neutral elevation tinted with the brand slate. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(55 70 73 / 0.10)",
    medium: "0 4px 12px rgb(55 70 73 / 0.14)",
    floating: "0 8px 24px rgb(55 70 73 / 0.18)"
  },
  // Motion durations are not strongly tokenised by the brand site publicly; kept
  // aligned with the Sentropic base ("à confirmer"). The site uses a 0.15s ease
  // transition on controls (.form-control transition).
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
  // --- Anatomy primitives (TotalEnergies) ----------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // .form-control border 1px
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. The brand site (Bootstrap-derived) targets ~38-40px medium
  // controls with 0.75rem inline padding (.form-control / .btn padding measured
  // 0.375rem 0.75rem). sm/lg follow the standard size scale ("à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // TotalEnergies typography: Roboto for interactive/fields/labels, Nunito for
  // display titles. Button labels use "Roboto Medium" (weight 500), no transform.
  typography: {
    control: { family: "'Roboto', system-ui, sans-serif", size: "1rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Roboto', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Roboto', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links (a) are Bleu #285AFF, not underlined at rest, underlined on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // brand controls dim disabled state to 0.5 (measured opacity:0.5)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a high-contrast OUTLINE in the focus blue (measured:
  // `outline: solid #0d59b9 0.2rem`). Primary buttons also add a brand-red 3px
  // border, but the shared focus technique is the blue outline.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: totalenergiesColor.blue.focus, // #0d59b9 focus outline blue
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px grey border (#ced4da)
  // and a 4px radius — measured on .form-control. `style: "outline"` makes the
  // builder draw four equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: totalenergiesColor.grey[0], // #ffffff
    underlineColor: totalenergiesColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the brand blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23285AFF' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + slight radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: totalenergiesColor.grey[50] // #f8f9fa
  },
  // Secondary button = OUTLINED in the brand red (the prominent red CTA inverts
  // to white-on-hover on the live site): transparent fill, red border + text,
  // light red fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: totalenergiesColor.red.main, // #E70000 stroke
    hoverBackground: totalenergiesColor.red.light // #fbe0e0 light fill on hover
  },
  // Tabs / top-nav: active tab = bold blue label with a bottom blue underline.
  tabs: {
    activeText: totalenergiesColor.blue.primary, // #285AFF
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
    text: totalenergiesColor.blue.primary, // #285AFF link text
    activeBackground: totalenergiesColor.blue.primary, // #285AFF filled active page
    activeText: totalenergiesColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: totalenergiesColor.blue.primary, // #285AFF
    text: totalenergiesColor.grey[500], // #6c757d trail text
    currentText: totalenergiesColor.grey[800], // #374649 current page
    separator: totalenergiesColor.grey[500], // #6c757d
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
    text: totalenergiesColor.grey[800], // #374649 summary label
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
    neutralBackground: totalenergiesColor.grey[50], // #f8f9fa
    neutralText: totalenergiesColor.grey[800] // #374649
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
    infoBackground: totalenergiesColor.blue.primary, // #285AFF
    infoText: totalenergiesColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: totalenergiesColor.grey[800] // #374649
  },
  // Search input.
  search: {
    paddingBlock: "0.375rem", // 6px (Bootstrap .form-control vertical padding)
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: totalenergiesColor.grey[800] // #374649
  }
} as const;

// --- semantic (TotalEnergies-specific role mapping) ------------------------
const semantic = {
  surface: {
    default: totalenergiesColor.grey[0], // white
    subtle: totalenergiesColor.grey[50], // #f8f9fa background alt
    raised: totalenergiesColor.grey[0], // white
    inverse: totalenergiesColor.grey[800], // #374649 dark slate inverse surface (à confirmer)
    overlay: "rgb(55 70 73 / 0.6)" // modal backdrop (brand slate tint)
  },
  text: {
    primary: totalenergiesColor.grey[800], // #374649 (body color)
    secondary: totalenergiesColor.grey[500], // #6c757d (--secondary)
    muted: totalenergiesColor.grey[600], // #707173 (--dark)
    inverse: totalenergiesColor.grey[0], // white on dark / coloured surfaces
    link: totalenergiesColor.blue.primary // #285AFF (a colour)
  },
  border: {
    subtle: totalenergiesColor.grey[200], // #ced4da (field stroke)
    strong: totalenergiesColor.grey[500], // #6c757d
    interactive: totalenergiesColor.blue.primary // #285AFF focus / interactive
  },
  action: {
    primary: totalenergiesColor.blue.primary, // #285AFF primary button
    primaryHover: totalenergiesColor.blue.hover, // #0038f4 darker hover (measured)
    primaryText: totalenergiesColor.grey[0], // white text on blue
    secondary: totalenergiesColor.grey[50], // #f8f9fa secondary surface
    secondaryHover: totalenergiesColor.grey[200], // #ced4da
    secondaryText: totalenergiesColor.blue.primary, // #285AFF
    danger: totalenergiesColor.red.main // #E70000 brand red
  },
  feedback: {
    success: totalenergiesColor.system.success,
    warning: totalenergiesColor.system.warning,
    error: totalenergiesColor.system.error,
    info: totalenergiesColor.system.info
  },
  status: {
    pending: totalenergiesColor.system.warning,
    processing: totalenergiesColor.system.info,
    completed: totalenergiesColor.system.success,
    failed: totalenergiesColor.system.error
  },
  // Categorical data-vis palette built from the measured brand hues. The brand
  // does not publish an 8-colour sequential scale, so this is a coherent
  // proposal drawn from the live CSS palette (see MAPPING.md, "à confirmer").
  data: {
    category1: totalenergiesColor.blue.primary, // #285AFF primary blue
    category2: totalenergiesColor.red.main, // #E70000 brand red
    category3: totalenergiesColor.system.success, // #73b355 green
    category4: totalenergiesColor.system.warning, // #db7e04 orange
    category5: "#ffdc00", // brand yellow (--yellow)
    category6: totalenergiesColor.system.info, // #17a2b8 teal
    category7: "#6f42c1", // purple (--purple)
    category8: totalenergiesColor.blue.deep // #004495 deep blue
  }
} as const;

/**
 * The TotalEnergies theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry TotalEnergies-specific measured
 * values, and the `component` layer is REBUILT from this theme's own semantic/
 * foundation via `createComponent` — so the TotalEnergies brand reaches the
 * components (buttons, tabs, pagination, chat bubbles…), not just the elements
 * that read semantic vars directly.
 */
export const totalenergiesTheme: TenantTheme = {
  id: "totalenergies",
  label: "TotalEnergies",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default totalenergiesTheme;
