import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Anthropic / Claude theme for the Sentropic token structure.
 *
 * All values below are measured on the PUBLIC Anthropic brand and the visible
 * claude.ai / anthropic.com surfaces. The colour palette comes from Anthropic's
 * own brand guidelines (the open `anthropics/skills` brand-guidelines skill):
 * Dark #141413, Light #faf9f5, Mid Gray #b0aea5, Light Gray #e8e6dc, and the
 * accent set Orange/clay #d97757, Blue #6a9bcc, Green #788c5d — completed by the
 * warmer product tones measured on claude.ai (Border Cream #f0eee6, the darker
 * terracotta #c96442, and the warm yellow-brown grey text scale #4d4c48 /
 * #5e5d59 / #87867f). We only reference the font *names* (Styrene, Copernicus,
 * Tiempos) here, never font binaries. Sources are documented in MAPPING.md.
 * Where Anthropic publishes no formal token for a Sentropic role, the closest
 * measured value is used (or a derived tint) and the choice is noted
 * "à confirmer" in MAPPING.md.
 *
 * Anthropic / Claude colour reference (light theme):
 *   Ivory / Light (warm canvas)        #faf9f5   (brand "Light" — surface.default)
 *   Border Cream (warm subtle surface) #f0eee6   (claude.ai cream border / subtle)
 *   Light Gray (subtle border)         #e8e6dc   (brand "Light Gray")
 *   White (raised cards / input fill)  #ffffff
 *   Clay / Orange (primary accent)     #d97757   (brand accent — primary action)
 *   Terracotta (darker clay / hover)   #c96442   (claude.ai darker clay CTA)
 *   Book cloth (historical clay)       #cc785c   (brand block clay — à confirmer)
 *   Accent Blue                        #6a9bcc   (brand accent blue)
 *   Accent Green                       #788c5d   (brand accent green)
 *   Mid Gray (placeholder / strong bd) #b0aea5   (brand "Mid Gray")
 *   Muted / tertiary text              #87867f
 *   Secondary text                     #5e5d59
 *   Strong text                        #4d4c48
 *   Dark / Ink (primary text)          #141413   (brand "Dark" — text.primary)
 */

// --- Anthropic raw colour palette (public brand + measured surfaces) --------
const anthropicColor = {
  // Clay — Anthropic's signature warm accent (the "Crail"/coral orange). This is
  // the brand accent that drives the Sentropic primary action.
  clay: {
    primary: "#d97757", // brand accent Orange — primary action / accent
    terracotta: "#c96442", // claude.ai darker terracotta — hover / active / illustration accent
    bookCloth: "#cc785c", // historical "Book cloth" clay (brand block) — à confirmer
    10: "#f5e0d5" // light clay tint (derived — à confirmer)
  },
  // Anthropic accent Blue — the only true cool hue in the brand set; mapped to the
  // Sentropic "cyan" accent slot.
  blue: {
    main: "#6a9bcc", // brand accent Blue
    dark: "#4a749b", // darker blue, AA on white (derived — à confirmer)
    10: "#e6eef6" // light blue tint (derived — à confirmer)
  },
  // Anthropic accent Green.
  green: {
    main: "#788c5d" // brand accent Green
  },
  // Warm neutrals — every grey carries a yellow-brown undertone (no cool blue-grey).
  cream: {
    0: "#ffffff", // white — raised cards / input fill
    ivory: "#faf9f5", // brand "Light" — the warm canvas (surface.default)
    border: "#f0eee6", // claude.ai "Border Cream" — warm subtle surface / cream border
    lightGray: "#e8e6dc" // brand "Light Gray" — subtle border / contrast surface
  },
  warm: {
    mid: "#b0aea5", // brand "Mid Gray" — placeholder / strong border
    muted: "#87867f", // tertiary / muted text
    secondary: "#5e5d59", // secondary text
    strong: "#4d4c48", // strong text
    ink: "#141413" // brand "Dark" — primary text / inverse surface
  },
  // System / status colours. Anthropic publishes no formal status scale; these are
  // warm-palette values (the brand green/blue darkened for WCAG AA on white, plus a
  // warm brick red and amber). All noted "à confirmer" in MAPPING.md.
  system: {
    success: "#5f7355", // brand green darkened for AA on white (à confirmer)
    error: "#b23c2c", // warm brick red (à confirmer)
    warning: "#9a630d", // warm amber, darkened for AA on white (à confirmer)
    info: "#4a749b" // brand accent blue darkened for AA (à confirmer)
  }
} as const;

// --- foundation (Anthropic-specific values) --------------------------------
const foundation = {
  color: {
    // Anthropic's primary is the warm clay, NOT a blue: the Sentropic "blue" role
    // family (which feeds the primary action) is mapped onto the clay family.
    blue: {
      10: anthropicColor.clay[10], // #f5e0d5 light clay tint (low-emphasis fill)
      60: anthropicColor.clay.primary, // #d97757 clay (primary action)
      80: anthropicColor.clay.terracotta // #c96442 darker terracotta (hover/active)
    },
    // Anthropic has no cyan; the closest accent is the brand Blue, so the Sentropic
    // "cyan" accent slot is mapped to the Anthropic accent-blue family.
    cyan: {
      10: anthropicColor.blue[10], // #e6eef6 light blue tint (à confirmer)
      50: anthropicColor.blue.main, // #6a9bcc Anthropic accent blue
      70: anthropicColor.blue.dark // #4a749b darker blue (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the warm Anthropic neutral scale.
    slate: {
      0: anthropicColor.cream[0], // white
      10: anthropicColor.cream.ivory, // #faf9f5 warm canvas / background alt
      20: anthropicColor.cream.lightGray, // #e8e6dc subtle border / contrast surface
      60: anthropicColor.warm.secondary, // #5e5d59 secondary text
      80: anthropicColor.warm.strong, // #4d4c48 strong text
      90: anthropicColor.warm.ink // #141413 primary text / darkest
    },
    feedback: {
      success: anthropicColor.system.success,
      warning: anthropicColor.system.warning,
      error: anthropicColor.system.error,
      info: anthropicColor.system.info
    }
  },
  // Anthropic ships "Styrene A/B" (Berton Hasebe, Commercial Type) for the sans
  // UI / headlines, and the bespoke serif "Copernicus" (claude.ai logo/display) +
  // "Tiempos" (Klim, marketing body) for the editorial serif. The book-title serif
  // headline is the Anthropic signature, so `font.display` is the serif and
  // `font.sans` is Styrene. Font *names* only, never binaries.
  font: {
    sans: "'Styrene B', 'Styrene A', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    display: "'Copernicus', 'Tiempos Headline', 'Tiempos Text', Georgia, 'Times New Roman', serif",
    mono: "ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace"
  },
  // Standard 4px-based rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; claude.ai uses a comparable 4px scale).
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
  // Anthropic aesthetic is warm and softly rounded: controls/inputs carry a soft
  // radius (~8px), cards a larger ~14px; chips/CTAs can go pill. (Exact per-element
  // radii "à confirmer".)
  radius: {
    none: "0",
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px — button / input / tabs
    lg: "0.875rem", // 14px — cards / panels
    pill: "999px" // pills / chips / circular send button
  },
  // Anthropic uses soft, warm, low-opacity elevation (ink-tinted). Exact specs
  // "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(20 20 19 / 0.05)",
    medium: "0 4px 16px rgb(20 20 19 / 0.08)",
    floating: "0 12px 32px rgb(20 20 19 / 0.12)"
  },
  // Motion durations are not strongly tokenised by Anthropic publicly; kept aligned
  // with the Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Anthropic-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Anthropic) --------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Anthropic control density. claude.ai controls target ~40px (md) with sm 32px
  // and lg 48px; horizontal padding is generous (warm, roomy feel). Exact metrics
  // "à confirmer".
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.875rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.5rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.9375rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1rem" }
  },
  // Anthropic typography = Styrene (sans) for UI / controls / labels / fields.
  // Button labels are medium weight, no transform; body/fields are regular.
  typography: {
    control: { family: "'Styrene B', 'Styrene A', ui-sans-serif, system-ui, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Styrene B', 'Styrene A', ui-sans-serif, system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Styrene B', 'Styrene A', ui-sans-serif, system-ui, sans-serif", size: "0.875rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Anthropic links are subtle ink underlines; hover keeps the underline (thicker).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "0.06em", decorationOffset: "0.15em",
      textDecorationHover: "underline", decorationThicknessHover: "0.1em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.5", // Anthropic dims disabled controls (~0.5 — à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // Anthropic FOCUS = a soft RING in the clay accent (warm, low-key). Exact
  // width/technique "à confirmer".
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: anthropicColor.clay.primary, // #d97757 clay ring
    inset: "0"
  },
  // Anthropic form fields are BOXED (outline): a white fill on the warm ivory
  // canvas, a 1px warm light-grey border and a soft radius (not a filled-underline).
  // `style: "outline"` makes the builder draw four equal borders from
  // `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: anthropicColor.cream[0], // #ffffff white input on the ivory canvas
    underlineColor: anthropicColor.cream.lightGray, // #e8e6dc (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the clay accent with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23d97757' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Anthropic cards: a 1px warm light border + 14px radius, subtle cream hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: anthropicColor.cream.border // #f0eee6 cream hover
  },
  // Anthropic secondary button = a warm ghost (transparent fill, warm light border,
  // cream fill on hover).
  buttonSecondary: {
    background: "transparent",
    border: anthropicColor.cream.lightGray, // #e8e6dc warm hairline stroke
    hoverBackground: anthropicColor.cream.border // #f0eee6 cream fill on hover
  },
  // Anthropic tabs / settings nav: active = clay label with a 2px bottom indicator.
  tabs: {
    activeText: anthropicColor.clay.primary, // #d97757
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "500",
    paddingBlock: "0.5rem", // 8px
    paddingInline: "0.875rem", // 14px
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Anthropic pagination: borderless clay text links; active page = filled clay.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: anthropicColor.clay.primary, // #d97757
    activeBackground: anthropicColor.clay.primary, // #d97757 filled active page
    activeText: anthropicColor.cream[0], // white on clay
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem" // 24px
  },
  // Anthropic breadcrumb: warm grey trail links, ink current page.
  breadcrumb: {
    linkText: anthropicColor.warm.secondary, // #5e5d59
    text: anthropicColor.warm.secondary, // #5e5d59 trail text
    currentText: anthropicColor.warm.ink, // #141413 current page
    separator: anthropicColor.warm.mid, // #b0aea5
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "500"
  },
  // Anthropic notice / alert: a soft warm cream filled box (rounded, no accent rule).
  alert: {
    background: anthropicColor.cream.border, // #f0eee6 cream
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0",
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.5rem" // 24px
  },
  // Anthropic disclosure: an ink medium-weight summary trigger.
  accordion: {
    text: anthropicColor.warm.ink, // #141413 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "500", // Anthropic summary weight
    lineHeight: "1.5rem" // 24px
  },
  // Anthropic tag/chip: a small soft-rounded warm chip.
  tag: {
    radius: "8px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.8125rem", // 13px
    fontWeight: "500",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: anthropicColor.cream.border, // #f0eee6
    neutralText: anthropicColor.warm.ink // #141413
  },
  // Anthropic badge: a small soft-rounded filled ink badge.
  badge: {
    radius: "6px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: anthropicColor.warm.ink, // #141413 ink badge
    infoText: anthropicColor.cream[0] // white
  },
  // Anthropic checkbox/radio label.
  choice: {
    labelFontSize: "0.9375rem", // 15px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: anthropicColor.warm.ink // #141413
  },
  // Anthropic search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.5rem" // 24px
  },
  // Anthropic toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: anthropicColor.warm.ink // #141413
  }
} as const;

// --- semantic (Anthropic-specific role mapping) ----------------------------
const semantic = {
  surface: {
    default: anthropicColor.cream.ivory, // #faf9f5 the warm ivory canvas (Anthropic signature)
    subtle: anthropicColor.cream.border, // #f0eee6 cream subtle surface / hover
    raised: anthropicColor.cream[0], // #ffffff white cards raised above the ivory
    inverse: anthropicColor.warm.ink, // #141413 dark ink inverse surface
    overlay: "rgb(20 20 19 / 0.5)" // modal backdrop (ink tint)
  },
  text: {
    primary: anthropicColor.warm.ink, // #141413 (brand "Dark")
    secondary: anthropicColor.warm.secondary, // #5e5d59
    muted: anthropicColor.warm.muted, // #87867f
    inverse: anthropicColor.cream.ivory, // #faf9f5 warm light text on dark/coloured surfaces
    link: anthropicColor.warm.ink // #141413 ink links (underlined; clay reserved for accents) — à confirmer
  },
  border: {
    subtle: anthropicColor.cream.lightGray, // #e8e6dc warm light border
    strong: anthropicColor.warm.mid, // #b0aea5
    interactive: anthropicColor.clay.primary // #d97757 clay interactive / focus
  },
  action: {
    primary: anthropicColor.clay.primary, // #d97757 clay primary button
    primaryHover: anthropicColor.clay.terracotta, // #c96442 darker terracotta hover
    primaryText: anthropicColor.cream[0], // white text on clay (à confirmer — ~2.9:1, the product's choice)
    secondary: anthropicColor.cream.border, // #f0eee6 warm secondary surface
    secondaryHover: anthropicColor.cream.lightGray, // #e8e6dc
    secondaryText: anthropicColor.warm.ink, // #141413
    danger: anthropicColor.system.error // #b23c2c warm brick red
  },
  feedback: {
    success: anthropicColor.system.success,
    warning: anthropicColor.system.warning,
    error: anthropicColor.system.error,
    info: anthropicColor.system.info
  },
  status: {
    pending: anthropicColor.system.warning,
    processing: anthropicColor.system.info,
    completed: anthropicColor.system.success,
    failed: anthropicColor.system.error
  },
  // Categorical data-vis palette built from the Anthropic brand hues. Anthropic
  // does not publish an 8-colour sequential scale, so this is a coherent proposal
  // drawn from the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: anthropicColor.clay.primary, // clay #d97757
    category2: anthropicColor.blue.main, // accent blue #6a9bcc
    category3: anthropicColor.green.main, // accent green #788c5d
    category4: anthropicColor.warm.ink, // ink #141413
    category5: anthropicColor.clay.terracotta, // terracotta #c96442
    category6: anthropicColor.warm.mid, // warm mid grey #b0aea5
    category7: anthropicColor.clay.bookCloth, // book cloth #cc785c (à confirmer)
    category8: "#bfa07a" // warm kraft / tan (à confirmer)
  }
} as const;

/**
 * The Anthropic / Claude theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Anthropic-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Anthropic brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const anthropicTheme: TenantTheme = {
  id: "anthropic",
  label: "Anthropic",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default anthropicTheme;
