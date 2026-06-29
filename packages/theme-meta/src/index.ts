import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Meta AI (Llama) theme for the Sentropic token structure.
 *
 * All values below are taken from Meta's PUBLIC brand palette (the official
 * "Meta Blue" family published in Meta's brand resource center), the Meta /
 * Facebook UI grey scale, and the Meta AI signature gradient ring (turquoise →
 * blue → pink). We only reference the font *names* (Optimistic Display,
 * Optimistic Text — Meta's custom Dalton Maag family) here, never the font
 * binaries. Sources are documented in MAPPING.md. Where Meta publishes no direct
 * equivalent for a Sentropic role, the closest brand token is used and the
 * choice is noted "à confirmer" in MAPPING.md.
 *
 * Meta / Meta AI colour reference (light theme):
 *   White (background default)         #ffffff
 *   Meta light grey (background alt)   #f0f2f5
 *   Meta grey 100 (subtle surface)     #e4e6eb
 *   Meta grey 300 (borders)            #ced0d4
 *   Meta grey 500 (muted/placeholder)  #8a8d91
 *   Meta grey 700 (secondary text)     #65676b
 *   Meta Gray (official, strong text)  #1c2b33
 *   Near-black (primary text)          #050505
 *   Meta Blue (official, action/link)  #0064e0
 *   Meta Bright Blue (official accent) #0082fb
 *   Meta Blue (darker hover, derived)  #0653b3
 *   Meta AI ring turquoise             #71f6d2
 *   Meta AI ring blue                  #0dacf1
 *   Meta AI ring pink                  #f5a3e0
 *
 * Meta AI brand gradient: the signature "ring" swirls turquoise #71f6d2 → blue
 * #0dacf1 → pink #f5a3e0 (with a derived violet companion #a64dff). TenantTheme
 * has no gradient token, so the stops live in `data.category*` and are
 * documented in MAPPING.md ("Signatures anatomiques").
 */

// --- Meta / Meta AI raw colour palette (public brand) ----------------------
const metaColor = {
  // Meta Blue — the brand / action family (official brand resource center).
  blue: {
    primary: "#0064e0", // Meta Blue (official "dark blue") — action / link
    bright: "#0082fb", // Meta Bright Blue (official) — focus accent + lighter
    hover: "#0653b3", // darker Meta Blue (derived — à confirmer)
    10: "#e7f0fe" // light blue fill / selected tint (derived — à confirmer)
  },
  // Meta AI signature gradient ring stops (mapped to the accent / data slots).
  gradient: {
    turquoise: "#71f6d2", // Meta AI ring turquoise
    sky: "#0dacf1", // Meta AI ring blue
    pink: "#f5a3e0", // Meta AI ring pink
    purple: "#a64dff" // violet companion (derived — à confirmer)
  },
  // Meta / Facebook UI grey scale (used across Meta surfaces).
  grey: {
    0: "#ffffff",
    50: "#f0f2f5", // Meta/FB light background
    100: "#e4e6eb", // subtle surface / hover fill / divider
    300: "#ced0d4", // default border
    500: "#8a8d91", // muted / placeholder text
    700: "#65676b", // secondary text / icons
    800: "#1c2b33", // Meta Gray (official) — strong text / inverse surface
    900: "#050505" // near-black primary text (Meta/FB — à confirmer)
  },
  // System / status colours (Meta semantic accents; AA notes in MAPPING.md).
  system: {
    success: "#31a24c", // Meta/FB success green (à confirmer)
    error: "#e41e3f", // Meta/FB red, AA-tuned on white (brand red #fa383e — à confirmer)
    warning: "#b26b00", // amber darkened for AA on white (à confirmer)
    info: "#0064e0" // Meta Blue
  }
} as const;

// --- foundation (Meta / Meta AI-specific values) ---------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto Meta Blue.
    blue: {
      10: metaColor.blue[10], // light Meta Blue tint (à confirmer)
      60: metaColor.blue.primary, // Meta Blue (primary)
      80: metaColor.blue.hover // darker Meta Blue (à confirmer)
    },
    // Meta has no cyan; the signature non-blue accent is the Meta AI gradient,
    // so the Sentropic "cyan" accent slot maps to the Meta AI ring turquoise/blue.
    cyan: {
      10: "#cffaee", // light turquoise tint (derived — à confirmer)
      50: metaColor.gradient.turquoise, // Meta AI ring turquoise
      70: metaColor.gradient.sky // Meta AI ring blue
    },
    // Sentropic "slate" role family mapped onto the Meta grey scale.
    slate: {
      0: metaColor.grey[0], // white
      10: metaColor.grey[50], // background alt
      20: metaColor.grey[300], // borders / contrast
      60: metaColor.grey[700], // secondary text
      80: metaColor.grey[800], // Meta Gray strong text
      90: metaColor.grey[900] // near-black primary text
    },
    feedback: {
      success: metaColor.system.success,
      warning: metaColor.system.warning,
      error: metaColor.system.error,
      info: metaColor.system.info
    }
  },
  // Meta ships "Optimistic Display" (headings / display) and "Optimistic Text"
  // (body / UI / fields) — a custom Dalton Maag family. Mono falls back to the
  // platform monospace (Meta ships no custom mono). Font *names* only.
  font: {
    sans: "'Optimistic Text', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    display: "'Optimistic Display', 'Optimistic Text', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    mono: "ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace"
  },
  // Standard 4px-based rem spacing scale (aligned with the Sentropic base).
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
  // Meta aesthetic is clean and ROUNDED. Controls/inputs carry an 8px radius,
  // cards 12px, primary CTAs read as pills (Meta AI "Get started" pill button).
  radius: {
    none: "0",
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px — button / input / tabs
    lg: "0.75rem", // 12px — cards
    pill: "999px" // pill CTAs / chips
  },
  // Soft, neutral, low-opacity shadows (Meta light UI). Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(28 43 51 / 0.10), 0 1px 3px rgb(28 43 51 / 0.08)",
    medium: "0 2px 6px rgb(28 43 51 / 0.12), 0 6px 16px rgb(28 43 51 / 0.10)",
    floating: "0 8px 24px rgb(28 43 51 / 0.14), 0 16px 48px rgb(28 43 51 / 0.16)"
  },
  // Motion durations / easing. Kept aligned with the Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Meta-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Meta / Meta AI) ---------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Meta control density. Buttons (md) target ~40px; sm (32px) and lg (48px)
  // follow the scale with generous horizontal padding (pill CTAs).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Meta typography: Optimistic Text for interactive/labels (semibold 600),
  // Optimistic Text for body/fields (regular 400).
  typography: {
    control: { family: "'Optimistic Text', system-ui, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Optimistic Text', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Optimistic Text', system-ui, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Meta links are NOT underlined at rest (Meta Blue text); underline on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // Meta disabled controls ~40% opacity (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // Meta FOCUS = a soft box-shadow RING in Meta Blue around the box (the modern
  // Meta UI default), not a native offset outline.
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "2px",
    color: metaColor.blue.primary, // #0064e0 Meta focus blue
    inset: "0"
  },
  // Meta form fields are BOXED & ROUNDED (outline): a white fill with a 1px grey
  // border and the 8px control radius (Meta's modern "outlined" input look).
  // `style: "outline"` draws four equal borders from `surface.default` +
  // `border.subtle`; the focus ring tints the border Meta Blue on focus.
  field: {
    style: "outline",
    fillBg: metaColor.grey[0], // #ffffff
    underlineColor: metaColor.grey[300], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Meta Blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230064e0' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Meta card: a 1px grey outline + 12px radius, subtle hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: metaColor.grey[50] // #f0f2f5
  },
  // Meta secondary action: a light grey FILLED button (Meta/FB "neutral" button),
  // dark label, slightly darker grey on hover.
  buttonSecondary: {
    background: metaColor.grey[100], // #e4e6eb light grey fill
    border: "transparent",
    hoverBackground: metaColor.grey[300] // #ced0d4 darker grey on hover
  },
  // Meta tabs: active tab = Meta Blue label with a 2px bottom indicator.
  tabs: {
    activeText: metaColor.blue.primary, // #0064e0
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px (Meta tab label)
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // indicator sits on the bottom edge
    indicatorMode: "border" // a real 2px bottom border
  },
  // Meta pagination: borderless blue text links; active page = filled Meta Blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: metaColor.blue.primary, // #0064e0 link text
    activeBackground: metaColor.blue.primary, // #0064e0 filled active page
    activeText: metaColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Meta breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: metaColor.blue.primary, // #0064e0
    text: metaColor.grey[700], // #65676b trail text
    currentText: metaColor.grey[800], // #1c2b33 current page
    separator: metaColor.grey[500], // #8a8d91
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // Meta banner / notice: a coloured LEFT accent filet on a transparent box.
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
  // Meta expansion panel: a dark semibold summary trigger.
  accordion: {
    text: metaColor.grey[800], // #1c2b33 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    fontWeight: "600", // Meta semibold
    lineHeight: "1.25rem" // 20px
  },
  // Meta chip: a pill-rounded grey chip.
  tag: {
    radius: "999px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    minHeight: "2rem", // 32px chip height
    neutralBackground: metaColor.grey[100], // #e4e6eb
    neutralText: metaColor.grey[800] // #1c2b33
  },
  // Meta badge: a small pill-ish filled badge.
  badge: {
    radius: "999px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1rem", // 16px
    textTransform: "none",
    minHeight: "1rem", // 16px
    infoBackground: metaColor.blue.primary, // #0064e0
    infoText: metaColor.grey[0] // white
  },
  // Meta checkbox/radio label.
  choice: {
    labelFontSize: "0.9375rem", // 15px
    labelLineHeight: "1.25rem", // 20px
    radioLineHeight: "1.25rem", // 20px
    labelColor: metaColor.grey[800] // #1c2b33
  },
  // Meta search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Meta toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.25rem", // 20px
    textColor: metaColor.grey[800] // #1c2b33
  }
} as const;

// --- semantic (Meta / Meta AI-specific role mapping) -----------------------
const semantic = {
  surface: {
    default: metaColor.grey[0], // white
    subtle: metaColor.grey[100], // #e4e6eb background alt / hover fill
    raised: metaColor.grey[0], // white
    inverse: metaColor.grey[800], // #1c2b33 Meta Gray dark inverse surface
    overlay: "rgb(28 43 51 / 0.6)" // modal backdrop (Meta Gray tint)
  },
  text: {
    primary: metaColor.grey[800], // #1c2b33 Meta Gray primary text
    secondary: metaColor.grey[700], // #65676b secondary text / icons
    muted: metaColor.grey[500], // #8a8d91 placeholder / disabled text
    inverse: metaColor.grey[0], // white on dark / coloured surfaces
    link: metaColor.blue.primary // #0064e0 Meta Blue link
  },
  border: {
    subtle: metaColor.grey[300], // #ced0d4 default border
    strong: metaColor.grey[500], // #8a8d91 stronger border
    interactive: metaColor.blue.primary // #0064e0 focus / interactive
  },
  action: {
    primary: metaColor.blue.primary, // #0064e0 primary button
    primaryHover: metaColor.blue.hover, // #0653b3 darker hover
    primaryText: metaColor.grey[0], // white text on blue
    secondary: metaColor.grey[100], // #e4e6eb secondary surface
    secondaryHover: metaColor.grey[300], // #ced0d4
    secondaryText: metaColor.grey[800], // #1c2b33 dark label
    danger: metaColor.system.error // #e41e3f
  },
  feedback: {
    success: metaColor.system.success,
    warning: metaColor.system.warning,
    error: metaColor.system.error,
    info: metaColor.system.info
  },
  status: {
    pending: metaColor.system.warning,
    processing: metaColor.system.info,
    completed: metaColor.system.success,
    failed: metaColor.system.error
  },
  // Categorical data-vis palette built from the Meta Blue family plus the Meta
  // AI gradient ring stops. Meta does not publish an 8-colour sequential
  // data-vis scale, so this is a coherent proposal (see MAPPING.md, "à confirmer").
  // Meta AI ring: #0dacf1 (sky) → #71f6d2 (turquoise) → #f5a3e0 (pink).
  data: {
    category1: metaColor.blue.primary, // Meta Blue #0064e0
    category2: metaColor.gradient.pink, // Meta AI ring pink
    category3: metaColor.gradient.turquoise, // Meta AI ring turquoise
    category4: metaColor.gradient.sky, // Meta AI ring blue
    category5: metaColor.gradient.purple, // violet companion (à confirmer)
    category6: metaColor.blue.bright, // Meta Bright Blue #0082fb
    category7: metaColor.grey[700], // Meta grey 700
    category8: metaColor.system.success // Meta green (à confirmer)
  }
} as const;

/**
 * The Meta AI (Llama) theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Meta-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Meta brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const metaTheme: TenantTheme = {
  id: "meta",
  label: "Meta AI",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default metaTheme;
