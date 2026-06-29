import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Google Gemini theme for the Sentropic token structure.
 *
 * All values below are taken from Google's PUBLIC brand / Material design
 * language (the four-colour brand palette, the Google UI grey scale used across
 * Workspace / Gemini, and the Gemini blue→purple gradient). We only reference
 * the font *names* (Google Sans, Google Sans Text, Roboto) here, never the font
 * binaries. Sources are documented in MAPPING.md. Where Google publishes no
 * direct equivalent for a Sentropic role, the closest brand token is used and
 * the choice is noted "à confirmer" in MAPPING.md.
 *
 * Google / Gemini colour reference (light theme):
 *   White (background default)        #ffffff
 *   Google Grey 50 (background alt)   #f8f9fa
 *   Google Grey 100 (subtle surface)  #f1f3f4
 *   Google Grey 300 (borders)         #dadce0
 *   Google Grey 700 (secondary text)  #5f6368
 *   Google Grey 800 (strong text)     #3c4043
 *   Google Grey 900 (primary text)    #202124
 *   Google Blue 600 (action / link)   #1a73e8
 *   Google Blue (logo / focus / grad) #4285f4
 *   Google Blue 700 (hover)           #1967d2
 *   Google Blue 50 (light fill)       #e8f0fe
 *   Gemini purple (gradient end)      #9b72cb
 *   Google Red 500 (brand)            #ea4335
 *   Google Red 700 (error / danger)   #d93025
 *   Google Yellow 500 (brand)         #fbbc04
 *   Google Green 600 (brand)          #34a853
 *   Google Green 700 (success)        #188038
 *
 * Gemini brand gradient: #4285f4 → #9b72cb (blue → purple). TenantTheme has no
 * gradient token, so the two stops live in `data.category6`/`data.category5`
 * and are documented in MAPPING.md ("Signatures anatomiques").
 */

// --- Google / Gemini raw colour palette (public brand) ---------------------
const geminiColor = {
  // Google Blue — the brand / action family.
  blue: {
    primary: "#1a73e8", // Google Blue 600 — UI action / link / interactive
    bright: "#4285f4", // Google Blue (logo) — focus accent + Gemini gradient start
    hover: "#1967d2", // Google Blue 700 — darker hover/active
    50: "#e8f0fe" // Google Blue 50 — light fill / selected chip background
  },
  // Gemini gradient purple — the signature Gemini accent (mapped to the cyan slot).
  purple: {
    main: "#9b72cb", // Gemini gradient purple end
    light: "#f3e8fd", // light purple tint (derived — à confirmer)
    dark: "#7b4fa8" // darker purple (derived — à confirmer)
  },
  // Google Red — brand / danger accent.
  red: {
    main: "#ea4335", // Google Red 500 (logo / brand red)
    error: "#d93025", // Google Red 700 (error text / destructive)
    50: "#fce8e6" // Google Red 50 — light red tint
  },
  // Google Yellow / amber.
  yellow: {
    main: "#fbbc04", // Google Yellow 500 (brand yellow)
    dark: "#e37400" // Google amber/orange 700, darkened for AA warning text on white
  },
  // Google Green.
  green: {
    main: "#34a853", // Google Green 600 (brand green)
    success: "#188038", // Google Green 700 (success text, AA on white)
    50: "#e6f4ea" // Google Green 50 — light green tint
  },
  // Google UI grey scale (used across Workspace / Gemini surfaces).
  grey: {
    0: "#ffffff",
    50: "#f8f9fa", // Google Grey 50 — background alt
    100: "#f1f3f4", // Google Grey 100 — subtle surface / hover fill
    300: "#dadce0", // Google Grey 300 — default border
    500: "#9aa0a6", // Google Grey 500 — muted / placeholder text
    700: "#5f6368", // Google Grey 700 — secondary text / icons
    800: "#3c4043", // Google Grey 800 — strong text
    900: "#202124" // Google Grey 900 — primary text / dark surface
  },
  // System / status colours (Google semantic tokens, AA-checked on white).
  system: {
    success: "#188038", // Google Green 700
    error: "#d93025", // Google Red 700
    warning: "#e37400", // Google amber 700 (darkened from #fbbc04 for AA)
    info: "#1a73e8" // Google Blue 600
  }
} as const;

// --- foundation (Google / Gemini-specific values) --------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto Google Blue.
    blue: {
      10: geminiColor.blue[50], // lightest Google Blue tint
      60: geminiColor.blue.primary, // Google Blue 600 (primary)
      80: geminiColor.blue.hover // Google Blue 700 (darker interactive)
    },
    // Google has no cyan; the signature non-blue accent is the Gemini gradient
    // purple, so the Sentropic "cyan" accent slot maps to the Gemini purple.
    cyan: {
      10: geminiColor.purple.light, // light purple tint (à confirmer)
      50: geminiColor.purple.main, // Gemini purple accent
      70: geminiColor.purple.dark // darker purple (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the Google grey scale.
    slate: {
      0: geminiColor.grey[0], // white
      10: geminiColor.grey[50], // background alt
      20: geminiColor.grey[300], // borders / contrast
      60: geminiColor.grey[700], // secondary text
      80: geminiColor.grey[800], // strong text
      90: geminiColor.grey[900] // primary text / darkest
    },
    feedback: {
      success: geminiColor.system.success,
      warning: geminiColor.system.warning,
      error: geminiColor.system.error,
      info: geminiColor.system.info
    }
  },
  // Google ships "Google Sans" (display / headings / buttons) and "Google Sans
  // Text" + "Roboto" (body / fields). Mono uses "Roboto Mono". Font *names*
  // only, never binaries.
  font: {
    sans: "'Google Sans Text', Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Google Sans', 'Google Sans Display', Roboto, system-ui, -apple-system, sans-serif",
    mono: "'Roboto Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard 4px-based rem spacing scale (Material uses an 8dp grid built on a
  // 4dp unit; aligned with the Sentropic base for component-grid fidelity).
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
  // Material aesthetic is generously ROUNDED. Controls/inputs carry an 8px
  // radius, cards 12px, chips/buttons read as pills.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.5rem", // 8px — button / input / tabs (Material small components)
    lg: "0.75rem", // 12px — cards (Material medium)
    pill: "999px" // chips / FAB / pill buttons
  },
  // Material elevation: soft, neutral, low-opacity shadows (key + ambient).
  // Exact dp specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(60 64 67 / 0.30), 0 1px 3px 1px rgb(60 64 67 / 0.15)",
    medium: "0 1px 3px rgb(60 64 67 / 0.30), 0 4px 8px 3px rgb(60 64 67 / 0.15)",
    floating: "0 4px 8px 3px rgb(60 64 67 / 0.15), 0 8px 24px 4px rgb(60 64 67 / 0.20)"
  },
  // Material motion durations / standard easing. Kept aligned with the Sentropic
  // base; standard easing matches Material's emphasized/standard curve ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Google-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Google / Gemini) --------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Google control density. Material buttons (md) target ~40px; sm (32px) and
  // lg (48px) follow the Material size scale with generous horizontal padding.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Google typography: Google Sans for interactive/labels (medium 500), Google
  // Sans Text / Roboto for body/fields.
  typography: {
    control: { family: "'Google Sans', Roboto, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "0.0107em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Google Sans Text', Roboto, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Google Sans', Roboto, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.25", letterSpacing: "0.0071em", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Google links are NOT underlined at rest (blue text); underline appears on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.38", // Material disabled = 38% opacity
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" }, // Material icons 18/20/24dp
  // Google FOCUS = a soft box-shadow RING in Google Blue around the box (the
  // Material/base default strategy), not a native offset outline.
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "2px",
    color: geminiColor.blue.primary, // #1a73e8 Google focus blue
    inset: "0"
  },
  // Google / Material form fields are BOXED & ROUNDED (outline): a white fill
  // with a 1px grey border and the 8px control radius (the modern Material 3 /
  // Gemini "outlined text field" look). `style: "outline"` makes the builder
  // draw four equal borders from `surface.default` + `border.subtle`; the focus
  // ring (above) tints the border Google Blue on focus.
  field: {
    style: "outline",
    fillBg: geminiColor.grey[0], // #ffffff
    underlineColor: geminiColor.grey[300], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Google Blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231a73e8' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Google / Material card: a 1px grey outline + 12px radius, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: geminiColor.grey[50] // #f8f9fa
  },
  // Material "Outlined button" = transparent fill, Google Blue border + text,
  // light blue state-layer fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: geminiColor.blue.primary, // #1a73e8 stroke
    hoverBackground: geminiColor.blue[50] // #e8f0fe light fill on hover
  },
  // Material tabs: active tab = Google Blue label with a 2px bottom indicator.
  tabs: {
    activeText: geminiColor.blue.primary, // #1a73e8
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px (Material tab label)
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // Material indicator sits on the bottom edge
    indicatorMode: "border" // a real 2px bottom border
  },
  // Google pagination: borderless blue text links; active page = filled blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: geminiColor.blue.primary, // #1a73e8 link text
    activeBackground: geminiColor.blue.primary, // #1a73e8 filled active page
    activeText: geminiColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Google breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: geminiColor.blue.primary, // #1a73e8
    text: geminiColor.grey[700], // #5f6368 trail text
    currentText: geminiColor.grey[900], // #202124 current page
    separator: geminiColor.grey[500], // #9aa0a6
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "500" // current page is emphasised
  },
  // Material banner / notice: a coloured LEFT accent filet on a transparent box.
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
  // Material expansion panel: a dark medium summary trigger.
  accordion: {
    text: geminiColor.grey[900], // #202124 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px
    fontWeight: "500", // Material medium
    lineHeight: "1.25rem" // 20px
  },
  // Material chip: a pill-rounded grey chip.
  tag: {
    radius: "16px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    minHeight: "2rem", // 32px Material chip height
    neutralBackground: geminiColor.grey[100], // #f1f3f4
    neutralText: geminiColor.grey[800] // #3c4043
  },
  // Material badge: a small 4px-radius filled badge.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1rem", // 16px
    infoBackground: geminiColor.blue.primary, // #1a73e8
    infoText: geminiColor.grey[0] // white
  },
  // Google checkbox/radio label.
  choice: {
    labelFontSize: "0.875rem", // 14px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: geminiColor.grey[900] // #202124
  },
  // Google search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Google toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: geminiColor.grey[900] // #202124
  }
} as const;

// --- semantic (Google / Gemini-specific role mapping) ----------------------
const semantic = {
  surface: {
    default: geminiColor.grey[0], // white
    subtle: geminiColor.grey[100], // #f1f3f4 background alt / hover fill
    raised: geminiColor.grey[0], // white
    inverse: geminiColor.grey[900], // #202124 dark inverse surface
    overlay: "rgb(32 33 36 / 0.6)" // modal backdrop (grey 900 tint)
  },
  text: {
    primary: geminiColor.grey[900], // #202124 primary text
    secondary: geminiColor.grey[700], // #5f6368 secondary text / icons
    muted: geminiColor.grey[500], // #9aa0a6 placeholder / disabled text
    inverse: geminiColor.grey[0], // white on dark / coloured surfaces
    link: geminiColor.blue.primary // #1a73e8 Google Blue link
  },
  border: {
    subtle: geminiColor.grey[300], // #dadce0 default border
    strong: geminiColor.grey[500], // #9aa0a6 stronger border
    interactive: geminiColor.blue.primary // #1a73e8 focus / interactive
  },
  action: {
    primary: geminiColor.blue.primary, // #1a73e8 primary button
    primaryHover: geminiColor.blue.hover, // #1967d2 darker hover
    primaryText: geminiColor.grey[0], // white text on blue
    secondary: geminiColor.grey[100], // #f1f3f4 secondary surface
    secondaryHover: geminiColor.grey[300], // #dadce0
    secondaryText: geminiColor.blue.primary, // #1a73e8
    danger: geminiColor.system.error // #d93025
  },
  feedback: {
    success: geminiColor.system.success,
    warning: geminiColor.system.warning,
    error: geminiColor.system.error,
    info: geminiColor.system.info
  },
  status: {
    pending: geminiColor.system.warning,
    processing: geminiColor.system.info,
    completed: geminiColor.system.success,
    failed: geminiColor.system.error
  },
  // Categorical data-vis palette built from the Google four-colour brand plus
  // the Gemini gradient stops. Google does not publish an 8-colour sequential
  // data-vis scale, so this is a coherent proposal (see MAPPING.md, "à confirmer").
  // The Gemini brand gradient is #4285f4 (category6) → #9b72cb (category5).
  data: {
    category1: geminiColor.blue.primary, // Google Blue 600
    category2: geminiColor.red.main, // Google Red
    category3: geminiColor.yellow.main, // Google Yellow
    category4: geminiColor.green.main, // Google Green
    category5: geminiColor.purple.main, // Gemini purple (gradient end)
    category6: geminiColor.blue.bright, // Google Blue logo (gradient start)
    category7: geminiColor.grey[700], // Google Grey 700
    category8: "#1ba1e3" // Gemini teal accent (à confirmer)
  }
} as const;

/**
 * The Google Gemini theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Google/Gemini-specific values, and
 * the `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Google brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const geminiTheme: TenantTheme = {
  id: "gemini",
  label: "Google Gemini",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default geminiTheme;
