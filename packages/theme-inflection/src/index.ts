import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Inflection AI (Pi) theme for the Sentropic token structure.
 *
 * All values below are measured from Pi's PUBLIC product CSS (the design-token
 * custom properties `--color-*` and `--font-*` shipped by pi.ai), captured via
 * the Internet Archive. We only reference the font *names* (GT Alpina, ABC
 * Oracle) here, never font binaries. Sources are documented in MAPPING.md. Pi
 * publishes a light (warm cream) and a dark theme; this theme maps the LIGHT
 * theme, which is Pi's signature warm/soft look. Where Pi has no direct
 * equivalent for a Sentropic role, the closest Pi token is used and the choice
 * is noted "à confirmer" in MAPPING.md.
 *
 * Pi colour reference (light theme — measured `--color-*`):
 *   Cream background (default)        #faf3ea   (--color-background / --color-default)
 *   Warm beige (secondary surface)    #f5eadc   (--color-secondary-default)
 *   Neutral fill (secondary button)   #ece1d2   (--color-fill-default)
 *   Warm white (cards / inputs)       #fcfaf7   (--color-card-default / --color-input-surface)
 *   Warm tan border / divider         #e1d3c0   (--color-divider-stroke)
 *   Input border (stronger)           #d9c9b4   (--color-input-border)
 *   Warm taupe (tertiary / placeholder) #a69986 (--color-text-tertiary)
 *   Warm taupe (secondary text)       #655e55   (--color-text-secondary)
 *   Warm dark brown (primary base)    #3e3a35   (--color-text-primary-base)
 *   Warm near-black (contrast text)   #1a1918   (--color-text-base-contrast)
 *   Pine green (PRIMARY / accent)     #1a4631   (--color-primary-default / --color-accent-default)
 *   Pine green hover                  #1e3c2e   (--color-primary-hover)
 *   Pine green deep (tap)             #21322a   (--color-primary-tap)
 *   Emerald green (success / alt)     #038247   (--color-tertiary-default / --color-progress-base)
 *   Emerald green deep                #0a6e40   (--color-tertiary-tap)
 *   Error red-orange                  #d42600   (--color-error-default)
 *   Dark inverse surface              #242322   (--color-background, dark theme)
 */

// --- Inflection / Pi raw colour palette (measured public design tokens) ----
const inflectionColor = {
  // Pine / forest green — the Pi brand / primary action family.
  green: {
    pine: "#1a4631", // --color-primary-default / --color-accent-default / --color-text-accent (primary)
    pineHover: "#1e3c2e", // --color-primary-hover
    pineDeep: "#21322a", // --color-primary-tap (darkest pine)
    emerald: "#038247", // --color-tertiary-default / --color-progress-base (brighter emerald accent / success)
    emeraldDeep: "#0a6e40", // --color-tertiary-tap (darker emerald)
    light: "#dce7e1" // light pine tint for low-emphasis surfaces (derived — à confirmer)
  },
  // Warm cream / beige neutral scale (Pi's signature warmth).
  cream: {
    white: "#fcfaf7", // --color-card-default / --color-input-surface (warm white card/input)
    bg: "#faf3ea", // --color-background / --color-default (cream page background)
    beige: "#f5eadc", // --color-secondary-default (warm beige secondary surface)
    fill: "#ece1d2", // --color-fill-default (neutral fill / secondary button)
    fillHover: "#e9ddcd", // --color-fill-hover
    border: "#e1d3c0", // --color-divider-stroke (warm tan divider)
    borderStrong: "#d9c9b4" // --color-input-border (stronger input border)
  },
  // Warm taupe / brown text scale.
  taupe: {
    muted: "#a69986", // --color-text-tertiary (light warm taupe — muted / placeholder)
    secondary: "#655e55", // --color-text-secondary (warm taupe secondary text)
    strong: "#3e3a35", // --color-text-primary-base (warm dark brown)
    contrast: "#1a1918" // --color-text-base-contrast (warm near-black primary text)
  },
  // Dark-theme background (used as the inverse surface in this light theme).
  dark: "#242322", // --color-background (Pi dark theme)
  // System / status colours. Pi publishes error + emerald green; warning has no
  // public Pi token, so it is a darkened warm amber picked for WCAG AA on cream.
  system: {
    success: "#038247", // --color-progress-base / --color-tertiary-default (emerald)
    error: "#d42600", // --color-error-default
    warning: "#b5621a", // warm amber, darkened for AA on cream (à confirmer)
    info: "#1a4631" // Pi has no blue; info uses the pine brand green
  }
} as const;

// --- foundation (Inflection / Pi-specific values) --------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Pi pine green (Pi has no blue;
    // its primary/action family is the forest green).
    blue: {
      10: inflectionColor.green.light, // light pine tint (derived — à confirmer)
      60: inflectionColor.green.pine, // #1a4631 primary pine green
      80: inflectionColor.green.pineDeep // #21322a darkest pine
    },
    // Pi has no cyan; the secondary brand accent is the brighter emerald green,
    // so the Sentropic "cyan" accent slot maps to the Pi emerald.
    cyan: {
      10: "#d6ebdf", // light emerald tint (derived — à confirmer)
      50: inflectionColor.green.emerald, // #038247 emerald accent
      70: inflectionColor.green.emeraldDeep // #0a6e40 darker emerald
    },
    // Sentropic "slate" role family mapped onto the Pi warm cream/taupe scale.
    slate: {
      0: inflectionColor.cream.white, // #fcfaf7 warm white
      10: inflectionColor.cream.bg, // #faf3ea cream background
      20: inflectionColor.cream.border, // #e1d3c0 warm tan border
      60: inflectionColor.taupe.secondary, // #655e55 secondary text
      80: inflectionColor.taupe.strong, // #3e3a35 warm dark brown
      90: inflectionColor.taupe.contrast // #1a1918 warm near-black
    },
    feedback: {
      success: inflectionColor.system.success,
      warning: inflectionColor.system.warning,
      error: inflectionColor.system.error,
      info: inflectionColor.system.info
    }
  },
  // Pi ships "GT Alpina" (serif — display / headings / hero) and "ABC Oracle"
  // (grotesque sans — body / UI / fields). Mono is a companion monospace. Font
  // *names* only, never binaries. (Internal CSS aliases: ALPINA, ORACLE, MONO.)
  font: {
    sans: "'ABC Oracle', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'GT Alpina', ui-serif, Georgia, 'Times New Roman', serif",
    mono: "'ABC Oracle Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace"
  },
  // Standard 4px-based rem spacing scale (kept aligned with the Sentropic base
  // for component-grid fidelity; Pi spacing not separately tokenised — à confirmer).
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
  // Pi's aesthetic is soft & generously ROUNDED. Controls/inputs carry a 12px
  // radius, cards 20px; chips/buttons read as pills. Exact radii à confirmer.
  radius: {
    none: "0",
    sm: "0.5rem", // 8px
    md: "0.75rem", // 12px — button / input / tabs
    lg: "1.25rem", // 20px — cards
    pill: "999px" // chips / pill buttons
  },
  // Pi uses soft, warm-tinted low-opacity elevation. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(38 35 34 / 0.06), 0 1px 3px rgb(38 35 34 / 0.08)",
    medium: "0 4px 12px rgb(38 35 34 / 0.10), 0 2px 4px rgb(38 35 34 / 0.06)",
    floating: "0 8px 28px rgb(38 35 34 / 0.14), 0 4px 8px rgb(38 35 34 / 0.08)"
  },
  // Motion durations are not strongly tokenised by Pi publicly; kept aligned
  // with the Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Pi-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Inflection / Pi) --------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Pi control density is comfortable / spacious (warm, roomy). md targets a
  // ~44px control height with generous horizontal padding. Exact specs à confirmer.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // Pi typography: ABC Oracle (sans) for interactive/labels/fields; GT Alpina
  // (serif) is reserved for display headings (font.display).
  typography: {
    control: { family: "'ABC Oracle', ui-sans-serif, system-ui, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.3", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'ABC Oracle', ui-sans-serif, system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'ABC Oracle', ui-sans-serif, system-ui, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Pi links are not underlined at rest (pine-green text); underline on hover (à confirmer).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // Pi dims disabled controls (uses warm disabled fills — approx, à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // Pi FOCUS = a soft RING in the pine green (à confirmer the exact technique).
  focus: {
    strategy: "ring",
    width: "3px",
    offset: "2px",
    color: inflectionColor.green.pine, // #1a4631 pine focus
    inset: "0"
  },
  // Pi form fields are BOXED & ROUNDED (outline): a warm-white fill (#fcfaf7)
  // with a 1px warm-tan border (#d9c9b4) and the 12px control radius — the soft
  // "outlined" Pi look. `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`; `fillBg` lifts the input
  // to the warmer white above the cream page.
  field: {
    style: "outline",
    fillBg: inflectionColor.cream.white, // #fcfaf7 warm-white input fill
    underlineColor: inflectionColor.cream.borderStrong, // #d9c9b4 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Pi pine green with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231a4631' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Pi cards: a warm-white fill, 1px warm-tan border, soft radius; hover tints to cream.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: inflectionColor.cream.bg // #faf3ea (--color-card-hover)
  },
  // Pi secondary button = a FILLED warm-beige button (not an outline), pine text,
  // slightly darker beige fill on hover.
  buttonSecondary: {
    background: inflectionColor.cream.fill, // #ece1d2 (--color-fill-default)
    border: "transparent",
    hoverBackground: inflectionColor.cream.fillHover // #e9ddcd (--color-fill-hover)
  },
  // Pi tabs / nav: active tab = pine-green label with a bottom indicator (à confirmer).
  tabs: {
    activeText: inflectionColor.green.pine, // #1a4631
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.4rem",
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pi pagination: borderless pine links; active page = filled pine (à confirmer).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: inflectionColor.green.pine, // #1a4631 link text
    activeBackground: inflectionColor.green.pine, // #1a4631 filled active page
    activeText: inflectionColor.cream.white, // warm white on pine
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.4rem"
  },
  // Pi breadcrumb: pine links, dark current page, taupe separators.
  breadcrumb: {
    linkText: inflectionColor.green.pine, // #1a4631
    text: inflectionColor.taupe.secondary, // #655e55 trail text
    currentText: inflectionColor.taupe.strong, // #3e3a35 current page
    separator: inflectionColor.taupe.muted, // #a69986
    fontSize: "0.875rem", // 14px
    lineHeight: "1.4rem",
    currentWeight: "500"
  },
  // Pi notice / alert: a coloured LEFT accent filet on a transparent box.
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
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.4rem"
  },
  // Pi accordion: a warm dark-brown medium summary trigger.
  accordion: {
    text: inflectionColor.taupe.strong, // #3e3a35 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    fontWeight: "500",
    lineHeight: "1.4rem"
  },
  // Pi tag: a soft pill-rounded warm chip.
  tag: {
    radius: "999px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.875rem", // 14px
    fontWeight: "500",
    lineHeight: "1.4rem",
    minHeight: "1.75rem", // 28px
    neutralBackground: inflectionColor.cream.fill, // #ece1d2
    neutralText: inflectionColor.taupe.strong // #3e3a35
  },
  // Pi badge: a soft-rounded filled badge in pine green.
  badge: {
    radius: "6px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: inflectionColor.green.pine, // #1a4631
    infoText: inflectionColor.cream.white // warm white
  },
  // Pi checkbox/radio label.
  choice: {
    labelFontSize: "0.9375rem", // 15px
    labelLineHeight: "1.4rem",
    radioLineHeight: "1.4rem",
    labelColor: inflectionColor.taupe.strong // #3e3a35
  },
  // Pi search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Pi toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.4rem",
    textColor: inflectionColor.taupe.strong // #3e3a35
  }
} as const;

// --- semantic (Inflection / Pi-specific role mapping) ----------------------
const semantic = {
  surface: {
    default: inflectionColor.cream.bg, // #faf3ea cream page background
    subtle: inflectionColor.cream.beige, // #f5eadc warm beige alt / hover surface
    raised: inflectionColor.cream.white, // #fcfaf7 warm white cards / modals
    inverse: inflectionColor.dark, // #242322 dark warm inverse surface
    overlay: "rgb(26 25 24 / 0.65)" // modal backdrop (--color-modal-backlay)
  },
  text: {
    primary: inflectionColor.taupe.contrast, // #1a1918 warm near-black primary text
    secondary: inflectionColor.taupe.secondary, // #655e55 secondary text
    muted: inflectionColor.taupe.muted, // #a69986 muted / placeholder
    inverse: inflectionColor.cream.white, // #fcfaf7 on dark / coloured surfaces
    link: inflectionColor.green.pine // #1a4631 pine-green link (--color-text-primary brand)
  },
  border: {
    subtle: inflectionColor.cream.border, // #e1d3c0 warm tan divider
    strong: inflectionColor.cream.borderStrong, // #d9c9b4 input border
    interactive: inflectionColor.green.pine // #1a4631 focus / interactive
  },
  action: {
    primary: inflectionColor.green.pine, // #1a4631 primary button
    primaryHover: inflectionColor.green.pineHover, // #1e3c2e darker pine hover
    primaryText: inflectionColor.cream.white, // #fcfaf7 warm white on pine
    secondary: inflectionColor.cream.fill, // #ece1d2 warm beige secondary surface
    secondaryHover: inflectionColor.cream.fillHover, // #e9ddcd
    secondaryText: inflectionColor.green.pine, // #1a4631 pine text on beige
    danger: inflectionColor.system.error // #d42600
  },
  feedback: {
    success: inflectionColor.system.success,
    warning: inflectionColor.system.warning,
    error: inflectionColor.system.error,
    info: inflectionColor.system.info
  },
  status: {
    pending: inflectionColor.system.warning,
    processing: inflectionColor.system.info,
    completed: inflectionColor.system.success,
    failed: inflectionColor.system.error
  },
  // Categorical data-vis palette built from the Pi greens + warm neutrals. Pi
  // does not publish an 8-colour sequential scale, so this is a coherent proposal
  // drawn from the Pi palette (see MAPPING.md, "à confirmer").
  data: {
    category1: inflectionColor.green.pine, // pine green
    category2: inflectionColor.green.emerald, // emerald green
    category3: inflectionColor.system.warning, // warm amber
    category4: inflectionColor.taupe.secondary, // taupe
    category5: inflectionColor.system.error, // error red-orange
    category6: inflectionColor.green.emeraldDeep, // deep emerald
    category7: inflectionColor.taupe.muted, // light taupe
    category8: inflectionColor.cream.border // warm tan
  }
} as const;

/**
 * The Inflection AI (Pi) theme as a Sentropic `TenantTheme`. The `tokens` tree
 * is complete: `foundation` and `semantic` carry Pi-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Pi brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const inflectionTheme: TenantTheme = {
  id: "inflection",
  label: "Inflection (Pi)",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default inflectionTheme;
