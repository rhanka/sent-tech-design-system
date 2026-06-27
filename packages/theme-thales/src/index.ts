import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Thales brand theme for the Sentropic token structure.
 *
 * All values below are MEASURED from the live production CSS of
 * thalesgroup.com (the Drupal "thales" theme bundle, /themes/custom/thales/dist/).
 * We only reference font *names* (Inter, Saira) here, never font binaries.
 * Sources and exact provenance are documented in MAPPING.md. Where the Thales
 * site does not expose a published value for a Sentropic role (e.g. light/dark
 * tints, the sm/lg densities, motion), the closest derived value is used and
 * the choice is noted "à confirmer" in MAPPING.md.
 *
 * Note on anchors: the commonly-cited #171f69 / #242B75 / #00b0b9 hexes are
 * LOGO/PRINT references (encycolorpedia, brandcolorcode) and are ABSENT from
 * the live web palette. The measured web identity is navy #00005c + vivid
 * action blue #0816a1 + light aqua #87edff.
 *
 * Thales colour reference (light theme, live thalesgroup.com CSS):
 *   White (background default)         #ffffff   (page background)
 *   Near-white (hover tint)            #fbfdfe   (button/icon hover)
 *   Pale blue (background alt)         #f4f9fb   (light surface; primary-button text)
 *   Lavender grey (light)              #d9d9e7   (light divider — derived role, à confirmer)
 *   Field border default               #c3c7c9   (input border 0.0625rem solid)
 *   Secondary text / placeholder grey  #6f7273   (secondary text, ::placeholder, disabled bg)
 *   Muted text                         #54585a   (derived darker neutral — à confirmer)
 *   Body / primary text                #252526   (body { color:#252526 })
 *   Darkest (navy-tinted)              #02023f   (gradient extremity — à confirmer)
 *   Action blue (links / primary CTA)  #0816a1   (a,.button-primary background — vivid action blue)
 *   Navy (active/focus, dark surfaces) #00005c   (.bg-dark, active/focus link, gradients)
 *   Indigo (secondary)                 #33337d   (dark-header borders, active menu)
 *   Aqua accent (links on dark)        #87edff   (.bg-dark a — navy→aqua gradient end)
 *   Success green                      #73b355   (Drupal status check icon)
 *   Warning amber                      #e29700   (warning icon)
 *   Error red                          #e32700   (error icon; alert text #cf3b30 on #fff4f4)
 *   Info blue                          #0816a1   (= action blue — derived, à confirmer)
 */

// --- Thales raw colour palette (measured from live thalesgroup.com CSS) -----
const thalesColor = {
  // Vivid action blue — links, primary button background, focus emphasis. This
  // is the interactive blue of the live site (NOT the navy, which is reserved
  // for active/focus states and dark surfaces).
  blue: {
    action: "#0816a1", // measured — a { color:#0816a1 }, .button-primary background
    light: "#e7e9f6", // derived light action tint (à confirmer)
    navy: "#00005c", // measured — .bg-dark background, active/focus link, gradients
    navyDarkest: "#02023f", // measured — gradient extremity
    indigo: "#33337d" // measured — dark-header borders, active menu state
  },
  // The Sentropic "cyan" accent slot carries Thales' light aqua #87edff — the
  // navy→aqua gradient end used for links/focus on dark surfaces (accent only,
  // NOT an interactive colour on light backgrounds).
  aqua: {
    accent: "#87edff", // measured — .bg-dark a { color:#87edff }
    light: "#e6fbff", // derived light aqua tint (à confirmer)
    dark: "#46c8e0" // derived darker aqua (à confirmer)
  },
  // Neutral scale. Most steps are measured from the live CSS; muted (#54585a)
  // and darkest (#02023f, navy-tinted) are derived (à confirmer).
  grey: {
    0: "#ffffff", // neutral 0 / surface default (page bg)
    25: "#fbfdfe", // near-white hover tint (measured)
    50: "#f4f9fb", // pale blue background alt (measured)
    150: "#d9d9e7", // light lavender divider (measured — derived role, à confirmer)
    200: "#c3c7c9", // subtle border / field stroke (measured input border)
    500: "#6f7273", // secondary text / placeholder / disabled (measured)
    600: "#54585a", // muted text (derived darker step — à confirmer)
    800: "#252526", // body / primary text (measured)
    900: "#02023f" // darkest, navy-tinted (measured gradient extremity — à confirmer)
  },
  // System / status colours, measured from the Drupal status icons + message
  // classes. Info reuses the action blue (no published info hue — à confirmer).
  system: {
    success: "#73b355", // measured — status check icon
    warning: "#e29700", // measured — warning icon
    error: "#e32700", // measured — error icon (alert text #cf3b30 on #fff4f4)
    info: "#0816a1" // = action blue (derived — à confirmer)
  }
} as const;

// --- foundation (Thales-specific values) -----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Thales action/navy blues:
    // action #0816a1 is the primary interactive blue; navy #00005c is the
    // darker active/focus state.
    blue: {
      10: thalesColor.blue.light, // lightest action tint
      60: thalesColor.blue.action, // #0816a1 vivid action blue (primary)
      80: thalesColor.blue.navy // #00005c navy — darker interactive / active
    },
    // The Sentropic "cyan" accent slot carries Thales' light aqua #87edff (the
    // navy→aqua gradient accent; accent/decorative, not interactive on light).
    cyan: {
      10: thalesColor.aqua.light, // light aqua tint
      50: thalesColor.aqua.accent, // #87edff aqua accent
      70: thalesColor.aqua.dark // darker aqua
    },
    // Sentropic "slate" role family mapped onto the measured grey scale.
    slate: {
      0: thalesColor.grey[0], // white
      10: thalesColor.grey[50], // pale blue background alt
      20: thalesColor.grey[200], // subtle borders / field stroke
      60: thalesColor.grey[500], // secondary text
      80: thalesColor.grey[800], // primary text
      90: thalesColor.grey[900] // darkest
    },
    feedback: {
      success: thalesColor.system.success,
      warning: thalesColor.system.warning,
      error: thalesColor.system.error,
      info: thalesColor.system.info
    }
  },
  // Thales digital type: titles in "Saira" (extra-light, weight 200 — the thin
  // geometric display face), body/controls/fields/labels in "Inter" (400). We
  // reference the font *names* only, not the binaries.
  font: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Saira', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; Thales uses a comparable rem scale).
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
  // Thales radii are MODEST and (on buttons) ASYMMETRIC. Inputs use a 6px
  // (0.375rem) radius; buttons use an asymmetric `0 0.625rem` diagonal that the
  // single-value radius schema cannot express, so `lg` carries the 10px
  // magnitude. See MAPPING.md "Signatures anatomiques".
  radius: {
    none: "0",
    sm: "0.375rem", // 6px — input / control (measured)
    md: "0.375rem", // 6px — input / control (measured)
    lg: "0.625rem", // 10px — measured button corner magnitude
    pill: "999px" // tags / pills (Thales uses 1.875rem in places — à confirmer)
  },
  // Light, neutral elevation tinted with the brand navy. Exact specs à confirmer.
  shadow: {
    subtle: "0 1px 2px rgb(0 0 92 / 0.10)",
    medium: "0 4px 12px rgb(0 0 92 / 0.14)",
    floating: "0 8px 24px rgb(0 0 92 / 0.18)"
  },
  // Motion durations are not strongly tokenised by Thales publicly; kept
  // aligned with the Sentropic base (à confirmer).
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
  // --- Anatomy primitives (Thales) -----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border ~0.0625rem ≈ 1px
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. ~40px medium controls with 0.75rem inline padding. sm/lg
  // follow the standard size scale (à confirmer).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Thales typography: Inter for interactive/fields/labels, Saira for display
  // titles. The live site applies a tight body letter-spacing of -0.0125rem and
  // a 1.4 line-height; button labels use Inter 600. No transform.
  typography: {
    control: { family: "'Inter', system-ui, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "-0.0125rem", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.4", letterSpacing: "-0.0125rem", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', system-ui, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "-0.0125rem", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are vivid action blue #0816a1 and UNDERLINED at rest
    // (a { text-decoration:underline }), staying underlined on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // disabled controls dim to 0.5 (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a high-contrast OUTLINE in the navy #00005c (the live :focus-visible
  // technique on light surfaces resolves links/controls to the navy emphasis).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: thalesColor.blue.navy, // #00005c navy focus outline
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px grey border (#c3c7c9)
  // and a 6px radius (measured: input border 0.0625rem solid #c3c7c9, radius
  // 0.375rem). `style: "outline"` draws four equal borders from
  // `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: thalesColor.grey[0], // #ffffff
    underlineColor: thalesColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the action blue with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230816a1' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + slight radius, pale-blue hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.4",
    hoverBackground: thalesColor.grey[50] // #f4f9fb
  },
  // Secondary button = OUTLINED in the action blue: transparent fill, blue
  // border + text, pale-blue fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: thalesColor.blue.action, // #0816a1 stroke
    hoverBackground: thalesColor.grey[50] // #f4f9fb pale fill on hover (à confirmer)
  },
  // Tabs / top-nav: active tab = bold action-blue label with a bottom underline.
  tabs: {
    activeText: thalesColor.blue.action, // #0816a1
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: borderless blue links; active page = filled action blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: thalesColor.blue.action, // #0816a1 link text
    activeBackground: thalesColor.blue.action, // #0816a1 filled active page
    activeText: thalesColor.grey[50], // #f4f9fb off-white on blue (measured button text)
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: thalesColor.blue.action, // #0816a1
    text: thalesColor.grey[500], // #6f7273 trail text
    currentText: thalesColor.grey[800], // #252526 current page
    separator: thalesColor.grey[500], // #6f7273
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "600"
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
    text: thalesColor.grey[800], // #252526 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: a small 6px-radius grey chip.
  tag: {
    radius: "0.375rem", // 6px (Thales button corners are asymmetric — à confirmer)
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: thalesColor.grey[50], // #f4f9fb
    neutralText: thalesColor.grey[800] // #252526
  },
  // Badge: a 6px-radius filled badge.
  badge: {
    radius: "0.375rem", // 6px
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "600",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: thalesColor.blue.action, // #0816a1
    infoText: thalesColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: thalesColor.grey[800] // #252526
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
    textColor: thalesColor.grey[800] // #252526
  }
} as const;

// --- semantic (Thales-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: thalesColor.grey[0], // white
    subtle: thalesColor.grey[50], // #f4f9fb pale blue background alt
    raised: thalesColor.grey[0], // white
    inverse: thalesColor.blue.navy, // #00005c navy dark surface (.bg-dark)
    overlay: "rgb(0 0 92 / 0.6)" // modal backdrop (brand navy tint)
  },
  text: {
    primary: thalesColor.grey[800], // #252526 (body text)
    secondary: thalesColor.grey[500], // #6f7273
    muted: thalesColor.grey[600], // #54585a (derived — à confirmer)
    inverse: thalesColor.grey[0], // white on dark / coloured surfaces
    link: thalesColor.blue.action // #0816a1 vivid action blue
  },
  border: {
    subtle: thalesColor.grey[200], // #c3c7c9 (field stroke)
    strong: thalesColor.grey[500], // #6f7273
    interactive: thalesColor.blue.action // #0816a1 interactive
  },
  action: {
    primary: thalesColor.blue.action, // #0816a1 action-blue primary button
    primaryHover: thalesColor.blue.navy, // #00005c navy hover (measured active state)
    primaryText: thalesColor.grey[50], // #f4f9fb off-white text on blue (measured)
    secondary: thalesColor.grey[50], // #f4f9fb secondary surface
    secondaryHover: thalesColor.grey[150], // #d9d9e7
    secondaryText: thalesColor.blue.action, // #0816a1
    danger: thalesColor.system.error // #e32700 error red
  },
  feedback: {
    success: thalesColor.system.success,
    warning: thalesColor.system.warning,
    error: thalesColor.system.error,
    info: thalesColor.system.info
  },
  status: {
    pending: thalesColor.system.warning,
    processing: thalesColor.system.info,
    completed: thalesColor.system.success,
    failed: thalesColor.system.error
  },
  // Categorical data-vis palette built from the brand hues. Thales does not
  // publish an 8-colour sequential scale, so this is a coherent proposal drawn
  // from the measured brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: thalesColor.blue.action, // #0816a1 action blue
    category2: thalesColor.aqua.accent, // #87edff aqua
    category3: thalesColor.blue.indigo, // #33337d indigo
    category4: thalesColor.system.success, // #73b355 green
    category5: thalesColor.system.warning, // #e29700 amber
    category6: thalesColor.system.error, // #e32700 red
    category7: thalesColor.grey[500], // #6f7273 grey
    category8: thalesColor.blue.navy // #00005c navy
  }
} as const;

/**
 * The Thales theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Thales-specific values, and the `component`
 * layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Thales brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const thalesTheme: TenantTheme = {
  id: "thales",
  label: "Thales",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default thalesTheme;
