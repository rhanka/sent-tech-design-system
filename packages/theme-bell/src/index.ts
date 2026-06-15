import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * BELL CANADA (bell.ca — the Montréal-HQ telecom) theme for the Sentropic token
 * structure.
 *
 * Bell's identity is a CONFIDENT BLUE-ON-NAVY telecom system: the signature
 * BELL BLUE (#0070CE — the single most-used brand hex, measured 21× across the
 * storefront's brand sheet) drives every primary CTA and brand accent; a deep
 * NAVY (#003078, with a near sibling #003778) is the reversed/inverse surface and
 * heading ground; surfaces are WHITE on a faint warm CREAM (#F7F5F2); text is a
 * near-black INK (#1d1d1b) on grey secondary (#555555); form fields are BOXED
 * outlines (white fill, thin grey #e1e1e1 stroke), and focus is a BLUE RING
 * (#0070CE, 2px) — the brand blue, used as an accessible focus indicator.
 *
 * Bell ships a proprietary display face ("bell-slim-heavy"); we cannot embed the
 * binary, so the public stack falls back to "Inter", Helvetica, Arial,
 * sans-serif. We reference font *names* only, never font binaries. Where Sentropic
 * needs a role Bell does not publish, the closest measured hex is used and the
 * choice is noted "à confirmer" in MAPPING.md.
 *
 * Bell colour reference (measured hex, brand sheet):
 *   Bell blue (action / brand)         #0070CE   primary CTA / brand accent (21× brand hex) — THE Bell blue
 *   Bell blue hover / active           #00549A   measured darker hover blue
 *   Navy (dark / inverse surface)      #003078   reversed/inverse surface ground
 *   Navy sibling                       #003778   near-navy variant (dark accent)
 *   Light blue tint                    #A8CDFF   faint blue tint (selection / soft fill)
 *   Ink (text primary)                 #1d1d1b   near-black body/heading ink (à confirmer)
 *   Secondary / muted text             #555555   secondary text (à confirmer)
 *   White (surface default)            #ffffff   surface default / CTA text
 *   Warm cream (subtle surface)        #F7F5F2   faint warm page cream
 *   Cream darker (secondary hover)     #ebe8e3   secondary control hover
 *   Field border / divider             #e1e1e1   input stroke / divider (1px)
 *   Border strong                      #999999   stronger control border (à confirmer)
 *   Danger red                         #d72020   error / danger fill (à confirmer)
 *   Success green                      #1f9d55   confirmation accent green
 *   Warning amber                      #b26a00   warning ink (à confirmer)
 *   Info blue                          #0070CE   info accent = Bell blue (à confirmer)
 */

// --- BELL raw colour palette (measured hex, brand sheet) --------------------
const bellColor = {
  // The brand IS the Bell blue. Used for the brand mark, every primary CTA and
  // blue accents.
  blue: {
    500: "#0070CE", // primary CTA / brand accent (21× brand hex) — THE Bell blue
    600: "#00549A", // measured darker hover/active blue
    tint: "#A8CDFF" // light blue tint (selection / soft fill)
  },
  // Deep navy ground — Bell's second pillar (reversed/inverse surfaces, dark
  // accents).
  navy: {
    500: "#003078", // reversed/inverse surface ground — THE Bell navy
    600: "#003778" // near-navy sibling variant
  },
  // Neutral ink scale (Bell never uses pure black for body text — measured
  // near-black #1d1d1b).
  ink: {
    default: "#1d1d1b", // near-black body/heading ink (à confirmer)
    secondary: "#555555" // secondary / muted text (à confirmer)
  },
  // Grey + warm-cream neutral scale (faint warm page cream + field strokes).
  grey: {
    cream: "#F7F5F2", // faint warm page cream (subtle surface)
    creamDark: "#ebe8e3", // secondary control hover
    200: "#e1e1e1", // input stroke / divider (1px)
    strong: "#999999" // stronger control border (à confirmer)
  },
  white: "#ffffff", // surface default / CTA text
  // System / status colours (measured / à confirmer).
  system: {
    danger: "#d72020", // error / danger fill (à confirmer)
    success: "#1f9d55", // confirmation accent green
    warning: "#b26a00", // warning ink (à confirmer)
    info: "#0070CE" // info accent = Bell blue (à confirmer)
  }
} as const;

// --- foundation (BELL-specific values) --------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Bell's PRIMARY
    // ACTION is the Bell blue; the lightest step is the faint blue tint.
    blue: {
      10: bellColor.blue.tint, // #A8CDFF faint blue tint
      60: bellColor.blue[500], // #0070CE THE Bell blue (primary action)
      80: bellColor.blue[600] // #00549A deep blue (hover/active ground)
    },
    // Sentropic "cyan" accent slot. Bell's cool accent is the navy family;
    // mapped here so a distinct deep accent survives (à confirmer).
    cyan: {
      10: "#eaf2fb", // faint blue tint (derived panel tint — à confirmer)
      50: bellColor.blue[500], // #0070CE Bell blue accent
      70: bellColor.navy[500] // #003078 deep navy
    },
    // Sentropic "slate" neutral family mapped onto the Bell ink + cream ramp.
    slate: {
      0: bellColor.white, // #ffffff white
      10: bellColor.grey.cream, // #F7F5F2 warm cream
      20: bellColor.grey[200], // #e1e1e1 divider / subtle border
      60: bellColor.ink.secondary, // #555555 secondary text
      80: bellColor.ink.default, // #1d1d1b primary text (near-black ink)
      90: bellColor.navy[500] // #003078 deep navy
    },
    feedback: {
      success: bellColor.system.success,
      warning: bellColor.system.warning,
      error: bellColor.system.danger,
      info: bellColor.system.info
    }
  },
  // Bell ships its proprietary "bell-slim-heavy" display face; the binary cannot
  // be embedded, so the public stack falls back to "Inter", Helvetica, Arial,
  // sans-serif (à confirmer). We reference family NAMES only. Mono is not part of
  // Bell — the Sentropic mono stack is kept.
  font: {
    sans: "'Inter', Helvetica, Arial, sans-serif",
    display: "'Inter', Helvetica, Arial, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Bell spacing: a 4/8px-based ramp aligned to the Sentropic step keys.
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
  // Bell rounds controls mildly: small chips 4px, controls/inputs 8px, cards
  // 12px, pill 999px for chips/tags (à confirmer — Bell's modern UI uses an 8px
  // control radius with fully-rounded pill chips).
  radius: {
    none: "0", // square
    sm: "4px", // small chips
    md: "8px", // modern input/control radius
    lg: "12px", // cards / larger surfaces
    pill: "999px" // fully-rounded chips / tags
  },
  // Bell elevation (soft light-tinted shadows). Mapped to the three Sentropic
  // slots (à confirmer — exact box-shadows not separately tokenised).
  shadow: {
    subtle: "0 1px 3px rgb(0 0 0 / 0.12)",
    medium: "0 4px 8px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.16), 0 2px 4px rgb(0 0 0 / 0.10)"
  },
  // Bell transitions are short and standard. Exact step ramp not separately
  // tokenised; kept aligned with the base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Bell-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (BELL) -------------------------------------------
  // Bell field/divider strokes 1px solid #e1e1e1; brand accent borders 1px
  // #0070CE. thick 2px kept for emphasis.
  borderWidth: {
    none: "0",
    thin: "1px", // measured input + divider stroke
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Bell control density. md targets a comfortable ~44px control; sm/lg bracket
  // it (à confirmer — heights aligned with the Sentropic base ramp).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Bell typography = "Inter" fallback (proprietary "bell-slim-heavy" display
  // cannot be embedded). Base type is 16px.
  typography: {
    control: { family: "'Inter', Helvetica, Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.125", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', Helvetica, Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', Helvetica, Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Bell links: Bell blue, underline on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // Bell disables controls at ≈ 40% (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // BELL FOCUS = a BLUE RING. The brand blue (#0070CE) is reused as a 2px ring
  // focus indicator (focus.strategy "ring") — the brand blue stands as the
  // accessible focus colour.
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: bellColor.blue[500], // #0070CE — Bell blue ring focus indicator
    inset: "0"
  },
  // BELL form fields are BOXED (outline): a white fill with a thin grey stroke
  // (#e1e1e1) and an 8px radius. `style: "outline"` makes the builder draw four
  // equal borders from `surface.default` + `border.subtle`. The native <select>
  // chevron is redrawn in the Bell blue with a 36px right gutter (appearance:
  // none).
  field: {
    style: "outline",
    fillBg: bellColor.white, // #ffffff
    underlineColor: bellColor.grey[200], // #e1e1e1 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230070CE' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Bell cards: white surface, rounded (12px), a soft grey border and a faint
  // warm cream hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: bellColor.grey.cream // #F7F5F2 faint warm cream hover
  },
  // Bell secondary button = soft cream fill, navy text, darker cream on hover.
  buttonSecondary: {
    background: bellColor.grey.cream, // #F7F5F2 cream fill
    border: bellColor.grey[200], // #e1e1e1 stroke
    hoverBackground: bellColor.grey.creamDark // #ebe8e3 darker cream hover
  },
  // Bell tabs / sub-nav: active tab = blue bold label with a blue bottom
  // indicator (the brand blue accent bar), transparent fill.
  tabs: {
    activeText: bellColor.blue[500], // #0070CE active label (Bell blue)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px (Bell base type)
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // blue underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Bell pagination: borderless blue link text; active page = filled blue pill
  // (the brand fill) with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: bellColor.blue[500], // #0070CE link text
    activeBackground: bellColor.blue[500], // #0070CE filled active page (brand blue)
    activeText: bellColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Bell breadcrumb: blue links, grey trail, navy current page, grey separators.
  breadcrumb: {
    linkText: bellColor.blue[500], // #0070CE
    text: bellColor.ink.secondary, // #555555 trail text
    currentText: bellColor.navy[500], // #003078 current page (navy)
    separator: bellColor.ink.secondary, // #555555
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // Bell notice / alert: a tinted box with a coloured left filet matching the
  // severity.
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
  // Bell accordion / disclosure: a semibold navy summary trigger, rounded,
  // grey-separated.
  accordion: {
    text: bellColor.navy[500], // #003078 summary label (navy)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600", // Bell summary triggers are semibold
    lineHeight: "1.5rem" // 24px
  },
  // Bell tag: a small PILL chip with a faint cream fill and navy ink.
  tag: {
    radius: "999px", // Bell chips round fully
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: bellColor.grey.cream, // #F7F5F2 faint cream fill
    neutralText: bellColor.navy[500] // #003078 navy
  },
  // Bell badge: a small filled badge — brand blue fill / white text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: bellColor.blue[500], // #0070CE brand blue
    infoText: bellColor.white // white on blue
  },
  // Bell checkbox/radio label: regular ink type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: bellColor.ink.default // #1d1d1b ink
  },
  // Bell search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Bell toggle / switch label: regular ink type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: bellColor.ink.default // #1d1d1b ink
  }
} as const;

// --- semantic (BELL-specific role mapping) ----------------------------------
const semantic = {
  surface: {
    default: bellColor.white, // #ffffff white
    subtle: bellColor.grey.cream, // #F7F5F2 warm cream
    raised: bellColor.white, // #ffffff white
    inverse: bellColor.navy[500], // #003078 deep navy reversed surface (brand dark)
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop
  },
  text: {
    primary: bellColor.ink.default, // #1d1d1b near-black ink (primary text + headings)
    secondary: bellColor.ink.secondary, // #555555 secondary text
    muted: bellColor.ink.secondary, // #555555
    inverse: bellColor.white, // white on dark/blue surfaces
    link: bellColor.blue[500] // #0070CE link blue
  },
  border: {
    subtle: bellColor.grey[200], // #e1e1e1 divider / input stroke
    strong: bellColor.grey.strong, // #999999 stronger control border
    interactive: bellColor.blue[500] // #0070CE brand blue (interactive accent)
  },
  action: {
    primary: bellColor.blue[500], // #0070CE THE Bell blue CTA
    primaryHover: bellColor.blue[600], // #00549A blue hover/active
    primaryText: bellColor.white, // white text on blue
    secondary: bellColor.grey.cream, // #F7F5F2 cream secondary surface
    secondaryHover: bellColor.grey.creamDark, // #ebe8e3
    secondaryText: bellColor.navy[500], // #003078 navy secondary label
    danger: bellColor.system.danger // #d72020 danger red
  },
  feedback: {
    success: bellColor.system.success, // #1f9d55
    warning: bellColor.system.warning, // #b26a00
    error: bellColor.system.danger, // #d72020
    info: bellColor.system.info // #0070CE
  },
  status: {
    pending: bellColor.system.warning, // #b26a00
    processing: bellColor.system.info, // #0070CE
    completed: bellColor.system.success, // #1f9d55
    failed: bellColor.system.danger // #d72020
  },
  // Categorical data-vis palette. Bell does not publish a single categorical
  // token list; the eight categories below are seeded from the measured brand
  // hexes (blue lead, navy, navy sibling, light-blue tint, success green, amber,
  // secondary ink, danger) to give a legible brand-true scale.
  // See MAPPING.md, "à confirmer" — this is an assembled scale.
  data: {
    category1: bellColor.blue[500], // #0070CE brand blue
    category2: bellColor.navy[500], // #003078 deep navy
    category3: bellColor.navy[600], // #003778 navy sibling
    category4: bellColor.blue.tint, // #A8CDFF light blue tint
    category5: bellColor.blue[600], // #00549A deep blue
    category6: bellColor.system.success, // #1f9d55 success green
    category7: bellColor.system.warning, // #b26a00 amber
    category8: bellColor.ink.secondary // #555555 secondary ink
  }
} as const;

/**
 * The BELL theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Bell-specific (blue-on-navy telecom) values,
 * and the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so Bell's blue CTA, near-black ink, boxed fields and
 * blue-ring focus reach the components (buttons, tabs, pagination, chat
 * bubbles…), not just the elements that read semantic vars directly.
 */
export const bellTheme: TenantTheme = {
  id: "bell",
  label: "Bell",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default bellTheme;
