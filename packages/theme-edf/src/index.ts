import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * EDF (Électricité de France) brand theme for the Sentropic token structure.
 *
 * All values below are a MEASURED-CLONE of the PUBLIC EDF brand design
 * (edf.fr / edf.com) cross-checked against published brand-colour references.
 * We only reference the font *names* (Open Sans as a public humanist proxy for
 * EDF's proprietary "Edf" typeface) here, never font binaries. Sources and exact
 * provenance are documented in MAPPING.md. Where the brand has no direct
 * equivalent for a Sentropic role, the closest measured value (or a derived
 * tint) is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * EDF colour reference (light theme):
 *   White (background default)        #ffffff   (page background)
 *   Grey light (background alt)        #f5f6f9   (neutral tint — derived)
 *   Field border default               #d6dae4   (subtle border — derived)
 *   Secondary text / muted grey        #687085   (neutral 500 — derived)
 *   Muted grey                         #4c5468   (neutral 600 — derived)
 *   Body / primary text                #1b2236   (neutral 800 — derived)
 *   Darkest slate                      #0e1424   (neutral 900 — derived)
 *   EDF deep blue (action / link)      #10367A   (EDF wordmark, Pantone 3591 C)
 *   Deep blue hover                    #0b2860   (derived darker blue)
 *   Deepest blue                       #081d45   (derived deep blue)
 *   EDF signature orange (accent)      #FE5716   (Pantone 172 C — iconic accent)
 *   Orange dark                        #d4430e   (derived dark orange)
 *   Success green                      #2e9e5b   (derived)
 *   Warning (brand orange)             #FE5716   (brand orange)
 *   Error red                          #d92d20   (derived destructive red)
 *   Info blue                          #2e7dd1   (derived)
 */

// --- EDF raw colour palette ------------------------------------------------
const edfColor = {
  // EDF deep blue — the brand wordmark colour and the accessible ACTION family
  // (primary buttons, links, interactive borders). White text clears WCAG AA.
  blue: {
    primary: "#10367A", // EDF deep blue (wordmark), Pantone 3591 C — action / link / brand
    hover: "#0b2860", // derived darker blue for hover/active (à confirmer)
    deep: "#081d45", // derived deepest blue (à confirmer)
    light: "#e6eaf2" // derived light blue tint for low-emphasis surfaces (à confirmer)
  },
  // EDF signature orange — the iconic brand accent (swirl symbol, active tab,
  // select chevron, secondary-button outline, focus ring). Used as the Sentropic
  // accent slot ("cyan") rather than the primary action, which stays the AA blue.
  orange: {
    main: "#FE5716", // EDF signature orange, Pantone 172 C — accent
    light: "#ffe9e1", // derived light orange tint (à confirmer)
    dark: "#d4430e" // derived dark orange for hover/active (à confirmer)
  },
  // Neutral grey scale (derived neutral ramp tuned to the brand slate — à confirmer).
  grey: {
    0: "#ffffff", // white / page background
    50: "#f5f6f9", // background alt
    200: "#d6dae4", // subtle border / field stroke
    500: "#687085", // secondary text
    600: "#4c5468", // muted text
    800: "#1b2236", // primary text
    900: "#0e1424" // darkest
  },
  // System / status colours. The warning role uses the brand signature orange
  // (#FE5716); error is a derived destructive red; success/info are derived
  // (the brand does not publish an explicit status palette) — see MAPPING.md.
  system: {
    success: "#2e9e5b", // derived success green (à confirmer)
    error: "#d92d20", // derived destructive red (à confirmer)
    warning: "#FE5716", // EDF signature orange used for warning emphasis
    info: "#2e7dd1" // derived info blue (à confirmer)
  }
} as const;

// --- foundation (EDF-specific values) --------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the EDF deep blue (action).
    blue: {
      10: edfColor.blue.light, // lightest blue tint
      60: edfColor.blue.primary, // #10367A deep blue primary
      80: edfColor.blue.hover // #0b2860 darker interactive blue
    },
    // EDF has no cyan; the brand's signature accent is the iconic orange, so the
    // Sentropic "cyan" accent slot is mapped to the EDF signature orange.
    cyan: {
      10: edfColor.orange.light, // light orange tint
      50: edfColor.orange.main, // #FE5716 EDF signature orange accent
      70: edfColor.orange.dark // darker orange
    },
    // Sentropic "slate" role family mapped onto the grey scale.
    slate: {
      0: edfColor.grey[0], // white
      10: edfColor.grey[50], // background alt
      20: edfColor.grey[200], // subtle borders / field stroke
      60: edfColor.grey[500], // secondary text
      80: edfColor.grey[800], // primary text
      90: edfColor.grey[900] // darkest
    },
    feedback: {
      success: edfColor.system.success,
      warning: edfColor.system.warning,
      error: edfColor.system.error,
      info: edfColor.system.info
    }
  },
  // EDF ships a proprietary "Edf" typeface; "Open Sans" is a public humanist
  // sans that approximates it for both display titles and body/controls. We
  // reference the font *names* only, not the binaries.
  font: {
    sans: "'Open Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Open Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; à confirmer against the brand's own scale).
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
  // EDF aesthetic is lightly rounded: controls/inputs carry a 4px radius, cards
  // a slightly larger 8px radius (à confirmer).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.25rem", // 4px — button / input / tabs
    lg: "0.5rem", // 8px — cards
    pill: "999px" // tags / pills
  },
  // Light, neutral elevation tinted with the brand slate (#1b2236). Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(27 34 54 / 0.10)",
    medium: "0 4px 12px rgb(27 34 54 / 0.14)",
    floating: "0 8px 24px rgb(27 34 54 / 0.18)"
  },
  // Motion durations are not strongly tokenised by the brand publicly; kept
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
  // --- Anatomy primitives (EDF) --------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density: ~40px medium controls with 0.75rem inline padding. sm/lg
  // follow the standard size scale ("à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // EDF typography: Open Sans for interactive/fields/labels and display titles.
  typography: {
    control: { family: "'Open Sans', system-ui, sans-serif", size: "1rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Open Sans', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Open Sans', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are deep blue #10367A, not underlined at rest, underlined on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5",
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a high-contrast OUTLINE in the EDF signature orange (#FE5716) — an
  // on-brand, distinctive focus ring with strong contrast on white.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: edfColor.orange.main, // #FE5716 EDF signature orange outline
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px grey border (#d6dae4)
  // and a 4px radius. `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: edfColor.grey[0], // #ffffff
    underlineColor: edfColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the EDF signature orange with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23FE5716' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + slight radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: edfColor.grey[50] // #f5f6f9
  },
  // Secondary button = OUTLINED in the EDF signature orange: transparent fill,
  // orange border + text, light orange fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: edfColor.orange.main, // #FE5716 orange stroke
    hoverBackground: edfColor.orange.light // #ffe9e1 light fill on hover
  },
  // Tabs / top-nav: active tab = orange label with a bottom indicator (iconic).
  tabs: {
    activeText: edfColor.orange.main, // #FE5716 signature orange
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
  // Pagination: borderless deep-blue text links; active page = filled deep blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: edfColor.blue.primary, // #10367A link text
    activeBackground: edfColor.blue.primary, // #10367A filled active page
    activeText: edfColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: deep-blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: edfColor.blue.primary, // #10367A
    text: edfColor.grey[500], // #687085 trail text
    currentText: edfColor.grey[800], // #1b2236 current page
    separator: edfColor.grey[500], // #687085
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
    text: edfColor.grey[800], // #1b2236 summary label
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
    neutralBackground: edfColor.grey[50], // #f5f6f9
    neutralText: edfColor.grey[800] // #1b2236
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
    infoBackground: edfColor.blue.primary, // #10367A
    infoText: edfColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: edfColor.grey[800] // #1b2236
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
    textColor: edfColor.grey[800] // #1b2236
  }
} as const;

// --- semantic (EDF-specific role mapping) ----------------------------------
const semantic = {
  surface: {
    default: edfColor.grey[0], // white
    subtle: edfColor.grey[50], // #f5f6f9 background alt
    raised: edfColor.grey[0], // white
    inverse: edfColor.grey[800], // #1b2236 dark slate inverse surface
    overlay: "rgb(27 34 54 / 0.6)" // modal backdrop (brand slate #1b2236 tint)
  },
  text: {
    primary: edfColor.grey[800], // #1b2236
    secondary: edfColor.grey[500], // #687085
    muted: edfColor.grey[600], // #4c5468
    inverse: edfColor.grey[0], // white on dark / coloured surfaces
    link: edfColor.blue.primary // #10367A EDF deep blue
  },
  border: {
    subtle: edfColor.grey[200], // #d6dae4 (field stroke)
    strong: edfColor.grey[500], // #687085
    interactive: edfColor.blue.primary // #10367A interactive
  },
  action: {
    primary: edfColor.blue.primary, // #10367A EDF deep blue primary
    primaryHover: edfColor.blue.hover, // #0b2860 darker hover
    primaryText: edfColor.grey[0], // white text on blue (AA)
    secondary: edfColor.grey[50], // #f5f6f9 secondary surface
    secondaryHover: edfColor.grey[200], // #d6dae4
    secondaryText: edfColor.blue.primary, // #10367A
    danger: edfColor.system.error // #d92d20 destructive red
  },
  feedback: {
    success: edfColor.system.success,
    warning: edfColor.system.warning,
    error: edfColor.system.error,
    info: edfColor.system.info
  },
  status: {
    pending: edfColor.system.warning,
    processing: edfColor.system.info,
    completed: edfColor.system.success,
    failed: edfColor.system.error
  },
  // Categorical data-vis palette built from the EDF brand hues. The brand does
  // not publish an 8-colour sequential scale, so this is a coherent proposal
  // drawn from the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: edfColor.orange.main, // #FE5716 signature orange
    category2: edfColor.blue.primary, // #10367A deep blue
    category3: edfColor.system.success, // #2e9e5b green
    category4: edfColor.system.info, // #2e7dd1 blue
    category5: edfColor.system.error, // #d92d20 red
    category6: edfColor.orange.dark, // #d4430e dark orange
    category7: edfColor.grey[500], // #687085 neutral
    category8: edfColor.blue.deep // #081d45 deepest blue
  }
} as const;

/**
 * The EDF theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry EDF-specific values, and the `component`
 * layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the EDF brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars.
 */
export const edfTheme: TenantTheme = {
  id: "edf",
  label: "EDF",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default edfTheme;
