import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Together AI theme for the Sentropic token structure.
 *
 * Every value below is MEASURED from Together AI's PUBLIC marketing CSS
 * (the Webflow stylesheet served on https://www.together.ai/), reading the
 * brand CSS custom properties (`--brand--*`, `--product--*`, `--_radius---*`)
 * and the live button / input rules. We reference the font *names* only
 * ("The Future", "The Future Mono", "PP Neue Montreal Mono"), never the font
 * binaries. Sources and provenance are documented in MAPPING.md. Where Together
 * publishes no direct equivalent for a Sentropic role, the closest measured
 * brand token is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Together AI colour reference (light theme, measured):
 *   White (--brand--white)                 #ffffff
 *   Light surface (#f6fafd, used 12x)       #f6fafd
 *   Light blue tint (#e5f3ff, used 11x)     #e5f3ff
 *   Neutral light (#f0f1f4)                 #f0f1f4
 *   Light border (#d6e0ef)                  #d6e0ef
 *   Grey 400 (#758696, border / muted)      #758696
 *   Grey 500 (.text-color-darkgray-2)       #626e7f
 *   Dark text (#1f232e)                     #1f232e
 *   Near-black text (#13171b)               #13171b
 *   Brand dark-blue (--brand--dark-blue)    #010120
 *   Brand black (--brand--black)            #000000
 *   Brand blue (primary / links / CTA)      #0f6fff
 *   Bright blue (#0082f3)                   #0082f3
 *   Product blue-01 (#9bcdf5)               #9bcdf5
 *   Brand orange (--brand--brand-orange)    #fc4c02
 *   Brand magenta (--brand--brand-magneta)  #ef2cc1
 *   Brand purple (--brand--brand-purple)    #caaef5
 *   Product purple-cards (#70549b)          #70549b
 *   Cyan (#03c7d1)                          #03c7d1
 *   Product cyan-01 (#70e9f0)               #70e9f0
 *   Product cyan-02 (#c8f6f9)               #c8f6f9
 *   Dark teal (#00747a)                     #00747a
 *   Brand red (#dd464c)                     #dd464c
 *
 * Together brand gradient: blue → purple → magenta → orange. TenantTheme has no
 * gradient token, so the stops live in the categorical `data.*` scale and the
 * signature is documented in MAPPING.md ("Signatures anatomiques").
 */

// --- Together AI raw colour palette (public Webflow brand CSS) --------------
const togetherColor = {
  // Together brand blue — the interactive / action / CTA family.
  blue: {
    primary: "#0f6fff", // measured: color/background/border of buttons + links (11 uses)
    bright: "#0082f3", // measured brighter blue accent
    hover: "#0d62e0", // darker hover/active (derived — à confirmer)
    light: "#e5f3ff", // measured light blue tint surface (11 uses)
    tint: "#9bcdf5" // measured --product--blue-01
  },
  // Together brand orange (--brand--brand-orange).
  orange: {
    main: "#fc4c02", // measured --brand--brand-orange
    warning: "#c43c00" // darkened for WCAG AA warning text on white (derived — à confirmer)
  },
  // Together brand magenta (--brand--brand-magneta).
  magenta: "#ef2cc1",
  // Together brand purple.
  purple: {
    light: "#caaef5", // measured --brand--brand-purple
    main: "#70549b" // measured --product--purple-cards
  },
  // Together cyan / teal family.
  cyan: {
    bright: "#03c7d1", // measured cyan
    light: "#70e9f0", // measured --product--cyan-01
    pale: "#c8f6f9", // measured --product--cyan-02
    dark: "#00747a" // measured dark teal (success / contrast)
  },
  // Together UI grey scale (measured surfaces / borders / text).
  grey: {
    0: "#ffffff", // --brand--white
    50: "#f6fafd", // measured light surface (12 uses)
    100: "#f0f1f4", // measured neutral light surface
    200: "#d6e0ef", // measured light border
    400: "#758696", // measured mid grey — border strong / muted text
    500: "#626e7f", // measured .text-color-darkgray-2 — secondary text
    800: "#1f232e", // measured dark text / tag text
    900: "#13171b", // measured near-black text
    darkBlue: "#010120", // measured --brand--dark-blue (signature deep navy)
    black: "#000000" // --brand--black
  },
  // System / status colours (measured where available, AA-adjusted for text).
  system: {
    success: "#00747a", // measured dark teal (AA on white)
    error: "#dd464c", // measured brand red
    warning: "#c43c00", // brand orange darkened for AA on white (à confirmer)
    info: "#0f6fff" // brand blue
  }
} as const;

// --- foundation (Together AI-specific values) ------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Together brand blue.
    blue: {
      10: togetherColor.blue.light, // #e5f3ff light blue tint
      60: togetherColor.blue.primary, // #0f6fff brand blue (primary)
      80: togetherColor.blue.hover // #0d62e0 darker interactive (à confirmer)
    },
    // Together publishes a real cyan / teal family — used for the accent slot.
    cyan: {
      10: togetherColor.cyan.pale, // #c8f6f9 pale cyan
      50: togetherColor.cyan.bright, // #03c7d1 cyan accent
      70: togetherColor.cyan.dark // #00747a dark teal
    },
    // Sentropic "slate" role family mapped onto the Together grey scale.
    slate: {
      0: togetherColor.grey[0], // white
      10: togetherColor.grey[50], // #f6fafd light surface
      20: togetherColor.grey[200], // #d6e0ef light border
      60: togetherColor.grey[500], // #626e7f secondary text
      80: togetherColor.grey[800], // #1f232e strong text
      90: togetherColor.grey.darkBlue // #010120 brand dark-blue (darkest)
    },
    feedback: {
      success: togetherColor.system.success,
      warning: togetherColor.system.warning,
      error: togetherColor.system.error,
      info: togetherColor.system.info
    }
  },
  // Together ships the custom "The Future" typeface (a Futura homage) for both
  // headings and body, and "The Future Mono" / "PP Neue Montreal Mono" for code,
  // buttons and eyebrow labels. Font *names* only, never binaries; Arial / system
  // stacks provide the public fallback.
  font: {
    sans: "'The Future', Arial, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'The Future', Arial, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'The Future Mono', 'PP Neue Montreal Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace"
  },
  // Standard 4px-based rem spacing scale (kept aligned with the Sentropic base
  // for component-grid fidelity; Together's marketing grid is not re-measured).
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
  // Together radii (measured --_radius---N): 4px dominant, 8px next, 12/16 for
  // larger surfaces, and a full pill on CTA buttons (.button-2 = 8rem).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px — --_radius---4 (dominant)
    md: "0.5rem", // 8px — --_radius---8, controls / inputs
    lg: "0.75rem", // 12px — --_radius---12, cards
    pill: "999px" // pill CTA buttons (.button-2)
  },
  // Soft neutral elevation. Exact dp specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(1 1 32 / 0.06), 0 1px 3px rgb(1 1 32 / 0.10)",
    medium: "0 4px 8px rgb(1 1 32 / 0.08), 0 2px 4px rgb(1 1 32 / 0.06)",
    floating: "0 12px 32px rgb(1 1 32 / 0.14), 0 4px 8px rgb(1 1 32 / 0.08)"
  },
  // Together's measured button transition is a ~450ms ease-out cubic-bezier.
  motion: {
    fast: "150ms",
    normal: "250ms",
    slow: "450ms", // measured .button transition-duration
    easing: "cubic-bezier(0.215, 0.61, 0.355, 1)" // measured .button easing
  },
  // z-index roles are not Together-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Together AI) ------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Together control density. Measured primary `.button` height = 2.5rem (40px)
  // with 1rem padding; sm/lg follow the base scale.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.375rem", minWidth: "2rem", fontSize: "0.75rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.8125rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3rem", fontSize: "0.9375rem" }
  },
  // Together typography: "The Future" for body / fields, and the measured
  // signature — buttons + eyebrow labels render in UPPERCASE MONO ("The Future
  // Mono" / "PP Neue Montreal Mono") with light tracking and medium weight.
  typography: {
    control: { family: "'The Future Mono', 'PP Neue Montreal Mono', ui-monospace, monospace", size: "0.8125rem", weight: "500", lineHeight: "1", letterSpacing: "0.005em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'The Future', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'The Future Mono', 'PP Neue Montreal Mono', ui-monospace, monospace", size: "0.75rem", weight: "500", lineHeight: "1.25", letterSpacing: "0.04em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Together links are NOT underlined at rest (brand-blue text); underline
    // appears on hover (à confirmer — link hover not strongly defined on site).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4",
  transition: { property: "background-color, border-color, color, box-shadow, opacity", duration: "450ms", easing: "cubic-bezier(0.215, 0.61, 0.355, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // Together FOCUS = a soft box-shadow RING in the brand blue around the box.
  // The marketing site only ships Webflow defaults, so the technique is chosen
  // as the modern brand-coherent ring ("à confirmer").
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "2px",
    color: togetherColor.blue.primary, // #0f6fff brand focus blue
    inset: "0"
  },
  // Together form fields are BOXED & ROUNDED (outline): a white fill with a 1px
  // border and the control radius. `style: "outline"` makes the builder draw
  // four equal borders from `surface.default` + `border.subtle`; the focus ring
  // tints the border brand-blue on focus.
  field: {
    style: "outline",
    fillBg: togetherColor.grey[0], // #ffffff
    underlineColor: togetherColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the brand blue with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230f6fff' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Together card: a 1px light-border outline + 12px radius, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: togetherColor.grey[50] // #f6fafd
  },
  // Together secondary button = outlined brand-blue (transparent fill, blue
  // stroke + text, light-blue state-layer fill on hover). The brand also ships a
  // black UPPERCASE-MONO primary button (see MAPPING.md, "Signatures").
  buttonSecondary: {
    background: "transparent",
    border: togetherColor.blue.primary, // #0f6fff stroke
    hoverBackground: togetherColor.blue.light // #e5f3ff light fill on hover
  },
  // Together tabs: active tab = brand-blue label with a 2px bottom indicator.
  tabs: {
    activeText: togetherColor.blue.primary, // #0f6fff
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // indicator sits on the bottom edge
    indicatorMode: "border" // a real 2px bottom border
  },
  // Together pagination: borderless blue text links; active page = filled blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: togetherColor.blue.primary, // #0f6fff link text
    activeBackground: togetherColor.blue.primary, // #0f6fff filled active page
    activeText: togetherColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.25rem" // 20px
  },
  // Together breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: togetherColor.blue.primary, // #0f6fff
    text: togetherColor.grey[500], // #626e7f trail text
    currentText: togetherColor.grey.darkBlue, // #010120 current page
    separator: togetherColor.grey[400], // #758696
    fontSize: "0.8125rem", // 13px
    lineHeight: "1.25rem", // 20px
    currentWeight: "500" // current page is emphasised
  },
  // Together banner / notice: a coloured LEFT accent filet on a transparent box.
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
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Together expansion panel: a dark medium summary trigger.
  accordion: {
    text: togetherColor.grey.darkBlue, // #010120 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    fontWeight: "500",
    lineHeight: "1.25rem" // 20px
  },
  // Together chip: a pill-rounded light chip.
  tag: {
    radius: "16px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    minHeight: "2rem", // 32px chip height
    neutralBackground: togetherColor.grey[100], // #f0f1f4
    neutralText: togetherColor.grey[800] // #1f232e
  },
  // Together badge: a small 4px-radius filled badge.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1rem", // 16px
    infoBackground: togetherColor.blue.primary, // #0f6fff
    infoText: togetherColor.grey[0] // white
  },
  // Together checkbox/radio label.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: togetherColor.grey.darkBlue // #010120
  },
  // Together search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Together toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: togetherColor.grey.darkBlue // #010120
  }
} as const;

// --- semantic (Together AI-specific role mapping) --------------------------
const semantic = {
  surface: {
    default: togetherColor.grey[0], // white
    subtle: togetherColor.grey[50], // #f6fafd light surface / hover fill
    raised: togetherColor.grey[0], // white
    inverse: togetherColor.grey.darkBlue, // #010120 brand dark-blue surface
    overlay: "rgb(1 1 32 / 0.6)" // modal backdrop (dark-blue tint)
  },
  text: {
    primary: togetherColor.grey.darkBlue, // #010120 primary text (brand dark-blue)
    secondary: togetherColor.grey[500], // #626e7f secondary text
    muted: togetherColor.grey[400], // #758696 placeholder / muted text
    inverse: togetherColor.grey[0], // white on dark / coloured surfaces
    link: togetherColor.blue.primary // #0f6fff brand-blue link
  },
  border: {
    subtle: togetherColor.grey[200], // #d6e0ef default border
    strong: togetherColor.grey[400], // #758696 stronger border
    interactive: togetherColor.blue.primary // #0f6fff focus / interactive
  },
  action: {
    primary: togetherColor.blue.primary, // #0f6fff primary button / CTA
    primaryHover: togetherColor.blue.hover, // #0d62e0 darker hover (à confirmer)
    primaryText: togetherColor.grey[0], // white text on blue
    secondary: togetherColor.grey[50], // #f6fafd secondary surface
    secondaryHover: togetherColor.blue.light, // #e5f3ff
    secondaryText: togetherColor.grey.darkBlue, // #010120
    danger: togetherColor.system.error // #dd464c
  },
  feedback: {
    success: togetherColor.system.success,
    warning: togetherColor.system.warning,
    error: togetherColor.system.error,
    info: togetherColor.system.info
  },
  status: {
    pending: togetherColor.system.warning,
    processing: togetherColor.system.info,
    completed: togetherColor.system.success,
    failed: togetherColor.system.error
  },
  // Categorical data-vis palette built from the measured Together brand gradient
  // (blue → purple → magenta → orange) plus the teal/cyan accents. Together does
  // not publish an 8-colour sequential data-vis scale, so this is a coherent
  // proposal from measured brand colours (see MAPPING.md, "à confirmer").
  data: {
    category1: togetherColor.blue.primary, // #0f6fff brand blue
    category2: togetherColor.orange.main, // #fc4c02 brand orange
    category3: togetherColor.magenta, // #ef2cc1 brand magenta
    category4: togetherColor.cyan.dark, // #00747a dark teal
    category5: togetherColor.purple.main, // #70549b brand purple
    category6: togetherColor.cyan.bright, // #03c7d1 cyan accent
    category7: togetherColor.grey[500], // #626e7f grey
    category8: togetherColor.blue.tint // #9bcdf5 light blue
  }
} as const;

/**
 * The Together AI theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Together-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Together brand reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const togetherTheme: TenantTheme = {
  id: "together",
  label: "Together AI",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default togetherTheme;
