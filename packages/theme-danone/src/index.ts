import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Danone corporate design system theme for the Sentropic token structure.
 *
 * MEASURED CLONE — colour values below are measured from the PUBLIC compiled CSS
 * of danone.com (Adobe AEM build, `theme/site.css`, June 2026). Danone exposes
 * its palette as CSS custom properties: a legacy `--colors-*` / `--btn-*` system
 * (the one actually rendered on screen today, ~285 occurrences of the brand
 * blue) plus a newer "renew" token system `--color-*` (neutral & semantic ramps,
 * defined but barely applied yet). Each comment cites the real source variable.
 * We only reference the font *names* (Danone's proprietary "DanoneOne"), never
 * the binaries. Sources and any derived ("à confirmer") values are in MAPPING.md.
 *
 * Danone (the "child gazing at a star" logo) is a friendly health-food brand:
 * the RENDERED primary is a clear corporate blue `#005eb8` (NOT the approximate
 * `#3b47a7` cited by third-party brand-colour sites, which does not appear in the
 * live CSS), backed by a deep navy `#002677`, a bright cyan section accent
 * `#00aced`, a teal `#0e9888`, and the signature star yellow `#ffd200`.
 *
 * Danone colour reference (measured, light theme):
 *   White (background default)        #ffffff   (--colors-text-white)
 *   Danone blue (primary / action)    #005eb8   (--colors-text-danone-blue / --btn-bg-primary)
 *   Navy (hover / inverse surface)    #002677   (--btn-bg-secondary-hover / --theme-background)
 *   Bright cyan (accent)              #00aced   (--theme-accentColor cyan)
 *   Teal (secondary accent)           #0e9888   (--colors-icon-secondary)
 *   Star yellow                       #ffd200   (--color-favourite-500)
 *   Success                           #00843d   (--colors-icon-success)
 *   Error                             #e81221   (--colors-text-error)
 *   Primary text                      #000000   (--colors-text-primary)
 */

// --- Danone raw colour palette (measured on danone.com compiled CSS) --------
const danoneColor = {
  // Danone corporate blue — the rendered primary / brand / action family.
  blue: {
    main: "#005eb8", // --colors-text-danone-blue / --btn-bg-primary / --colors-icon-primary (measured, ~285×)
    navy: "#002677", // --btn-bg-secondary-hover/active / --theme-background (measured) — darker / inverse
    light: "#ccdff1" // --theme-accentColor light-blue tint (measured accent palette)
  },
  // Bright cyan — the Danone section accent (Sentropic "cyan" slot maps directly).
  cyan: {
    main: "#00aced", // --theme-accentColor cyan (measured) — closest live value to the charte "light blue"
    light: "#cceefb", // light cyan tint (derived from #00aced — à confirmer)
    dark: "#0089bd" // darker cyan for hover/active (derived — à confirmer)
  },
  // Teal — Danone secondary icon accent.
  teal: "#0e9888", // --colors-icon-secondary (measured)
  // Star yellow — the Danone "star" / favourite accent.
  yellow: "#ffd200", // --color-favourite-500 (measured renew token)
  // Neutral grey scale — measured (renew `--color-neutral-*` ramp + legacy greys).
  grey: {
    0: "#ffffff", // --colors-text-white / --colors-icon-white (measured)
    50: "#f8f8f8", // --color-neutral-50 (measured renew) — light background alt
    100: "#eeeeee", // --colors-icon-grey-light (measured legacy)
    200: "#e0e0e0", // --colors-text-quaternary (measured legacy) — subtle border
    500: "#9e9e9e", // --colors-icon-grey / --colors-text-tertiary (measured legacy) — muted text
    600: "#666666", // --colors-text-medium-gray ≈ rgba(0,0,0,.6) (measured legacy) — secondary text
    800: "#333333", // strong text (derived step — à confirmer)
    900: "#000000" // --colors-text-primary (measured legacy) — primary / darkest text
  },
  // System / status colours (legacy icon tokens + renew semantic ramp, measured).
  system: {
    success: "#00843d", // --colors-icon-success (measured legacy)
    error: "#e81221", // --colors-icon-error / --colors-text-error (measured legacy)
    warning: "#d45900", // --color-warning-500 (measured renew)
    info: "#2a7ab0" // --color-info-500 (measured renew)
  }
} as const;

// --- foundation (Danone-specific values) -----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Danone corporate blue.
    blue: {
      10: danoneColor.blue.light, // #ccdff1 light-blue tint (measured accent)
      60: danoneColor.blue.main, // #005eb8 Danone blue (primary)
      80: danoneColor.blue.navy // #002677 navy (darker interactive / inverse)
    },
    // Danone HAS a real bright cyan section accent — the Sentropic "cyan" slot
    // maps directly onto it (no proxy needed).
    cyan: {
      10: danoneColor.cyan.light, // #cceefb light cyan tint (derived — à confirmer)
      50: danoneColor.cyan.main, // #00aced bright cyan accent (measured)
      70: danoneColor.cyan.dark // #0089bd darker cyan (derived — à confirmer)
    },
    // Sentropic "slate" role family mapped onto the Danone neutral scale.
    slate: {
      0: danoneColor.grey[0], // white
      10: danoneColor.grey[50], // #f8f8f8 background alt
      20: danoneColor.grey[200], // #e0e0e0 subtle borders / contrast background
      60: danoneColor.grey[600], // #666666 secondary text
      80: danoneColor.grey[800], // #333333 strong text
      90: danoneColor.grey[900] // #000000 primary / darkest text
    },
    feedback: {
      success: danoneColor.system.success,
      warning: danoneColor.system.warning,
      error: danoneColor.system.error,
      info: danoneColor.system.info
    }
  },
  // Danone ships a PROPRIETARY brand typeface "DanoneOne", declared in
  // theme/site.css as `DanoneOne Regular` (`--fonts-body`) and `DanoneOne Bold`
  // (`--fonts-title` / `--fonts-bold`), with a `sans-serif` fallback. We
  // reference the font *names* only, never the binaries; Danone ships no mono so
  // the Sentropic mono stack is kept.
  font: {
    sans: "'DanoneOne', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    display: "'DanoneOne', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; danone.com uses a comparable 4px-based scale).
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
  // Danone aesthetic is FRIENDLY / SOFT: controls and cards carry a generous
  // rounded radius (approachable health-food brand). Exact radii not directly
  // tokenised publicly — derived to express the soft brand feel (à confirmer).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.5rem", // 8px — button / input / tabs (soft rounded)
    lg: "0.75rem", // 12px — cards
    pill: "999px" // tags / pills
  },
  // Danone uses soft, blue-tinted elevation. Exact specs derived ("à confirmer").
  shadow: {
    subtle: "0 1px 2px rgb(0 94 184 / 0.10)",
    medium: "0 4px 12px rgb(0 94 184 / 0.14)",
    floating: "0 10px 28px rgb(0 94 184 / 0.18)"
  },
  // Motion durations are not strongly tokenised by Danone publicly; kept aligned
  // with the Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Danone-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Danone) -----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Danone control density: comfortable and approachable (derived rhythm — the
  // public corporate site exposes few bordered controls to measure directly).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // Danone typography: the DanoneOne brand face for headings/labels and body;
  // interactive controls are medium-weight, not uppercase.
  typography: {
    control: { family: "'DanoneOne', system-ui, sans-serif", size: "1rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'DanoneOne', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'DanoneOne', system-ui, sans-serif", size: "0.9375rem", weight: "700", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Danone links: brand blue, underline appears on hover (friendly editorial
    // style — offset/thickness derived, à confirmer).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.08em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.5", // Danone dims disabled controls (derived — à confirmer)
  transition: { property: "background-color, border-color, color, outline-color", duration: "180ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // Danone FOCUS = a high-contrast OUTLINE in the bright cyan section accent.
  // Width/offset derived (à confirmer — focus rings not directly tokenised).
  focus: {
    strategy: "outline",
    width: "3px",
    offset: "2px",
    color: danoneColor.cyan.main, // #00aced bright cyan focus ring
    inset: "0"
  },
  // Danone form fields are BOXED (outline): white fill, 1px grey border, soft
  // rounded corners. Native <select> chevron redrawn in the Danone blue. The
  // exact field treatment is derived (à confirmer — few styled inputs on the
  // corporate home).
  field: {
    style: "outline",
    fillBg: danoneColor.grey[0], // #ffffff
    underlineColor: danoneColor.grey[500], // unused for outline, kept for completeness
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23005eb8' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Danone cards: a 1px grey border + soft radius, light background hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: danoneColor.grey[50] // #f8f8f8
  },
  // Danone secondary button = OUTLINED (transparent fill, Danone-blue border +
  // text, light-blue fill on hover).
  buttonSecondary: {
    background: "transparent",
    border: danoneColor.blue.main, // #005eb8 stroke
    hoverBackground: danoneColor.blue.light // #ccdff1 light fill on hover
  },
  // Danone tabs / nav: active tab = bold blue label with a bottom blue underline.
  tabs: {
    activeText: danoneColor.blue.main, // #005eb8
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // underline on the bottom edge
    indicatorMode: "border" // a real bottom border
  },
  // Danone pagination: borderless blue text links; active page = filled blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: danoneColor.blue.main, // #005eb8 link text
    activeBackground: danoneColor.blue.main, // #005eb8 filled active page
    activeText: danoneColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Danone breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: danoneColor.blue.main, // #005eb8
    text: danoneColor.grey[600], // #666666 trail text
    currentText: danoneColor.grey[900], // #000000 current page
    separator: danoneColor.grey[500], // #9e9e9e
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700"
  },
  // Danone notice / alert: a coloured LEFT accent filet on a transparent box.
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
  // Danone details: a blue bold summary trigger.
  accordion: {
    text: danoneColor.blue.main, // #005eb8 summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // Danone tag: a small soft pill chip.
  tag: {
    radius: "999px", // friendly pill chip
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.875rem", // 14px
    fontWeight: "600",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: danoneColor.grey[50], // #f8f8f8
    neutralText: danoneColor.blue.main // #005eb8
  },
  // Danone badge: a soft pill filled badge.
  badge: {
    radius: "999px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.8125rem", // 13px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: danoneColor.cyan.main, // #00aced bright cyan badge
    infoText: danoneColor.grey[0] // white
  },
  // Danone checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: danoneColor.grey[900] // #000000
  },
  // Danone search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Danone toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: danoneColor.grey[900] // #000000
  }
} as const;

// --- semantic (Danone-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: danoneColor.grey[0], // white
    subtle: danoneColor.grey[50], // #f8f8f8 light background alt
    raised: danoneColor.grey[0], // white
    inverse: danoneColor.blue.navy, // #002677 navy inverse surface (--theme-background)
    overlay: "rgb(0 38 119 / 0.6)" // modal backdrop (navy tint)
  },
  text: {
    primary: danoneColor.grey[900], // #000000 (--colors-text-primary)
    secondary: danoneColor.grey[600], // #666666 (--colors-text-medium-gray)
    muted: danoneColor.grey[500], // #9e9e9e (--colors-text-tertiary)
    inverse: danoneColor.grey[0], // white on dark / coloured surfaces
    link: danoneColor.blue.main // #005eb8 Danone blue links
  },
  border: {
    subtle: danoneColor.grey[200], // #e0e0e0 (--colors-text-quaternary)
    strong: danoneColor.grey[500], // #9e9e9e (--colors-icon-grey)
    interactive: danoneColor.blue.main // #005eb8 interactive
  },
  action: {
    primary: danoneColor.blue.main, // #005eb8 primary button (--btn-bg-primary)
    primaryHover: danoneColor.blue.navy, // #002677 navy hover (--btn-bg-secondary-hover)
    primaryText: danoneColor.grey[0], // white text on blue
    secondary: danoneColor.grey[50], // #f8f8f8 secondary surface
    secondaryHover: danoneColor.grey[200], // #e0e0e0
    secondaryText: danoneColor.blue.main, // #005eb8
    danger: danoneColor.system.error // #e81221 (--colors-text-error)
  },
  feedback: {
    success: danoneColor.system.success, // #00843d
    warning: danoneColor.system.warning, // #d45900
    error: danoneColor.system.error, // #e81221
    info: danoneColor.system.info // #2a7ab0
  },
  status: {
    pending: danoneColor.system.warning,
    processing: danoneColor.system.info,
    completed: danoneColor.system.success,
    failed: danoneColor.system.error
  },
  // Categorical data-vis palette built from the measured Danone brand hues.
  // Danone publishes no 8-colour sequential scale, so this is a coherent proposal
  // drawn from the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: danoneColor.blue.main, // #005eb8 Danone blue
    category2: danoneColor.cyan.main, // #00aced bright cyan
    category3: danoneColor.teal, // #0e9888 teal
    category4: danoneColor.system.success, // #00843d green
    category5: danoneColor.blue.navy, // #002677 navy
    category6: danoneColor.yellow, // #ffd200 star yellow
    category7: danoneColor.grey[600], // #666666 grey
    category8: danoneColor.system.warning // #d45900 amber
  }
} as const;

/**
 * The Danone theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Danone-specific measured values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Danone brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const danoneTheme: TenantTheme = {
  id: "danone",
  label: "Danone",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default danoneTheme;
