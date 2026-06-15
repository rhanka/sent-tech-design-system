import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * WORKLEAP (workleap.com — the Montréal employee-experience SaaS) theme for the
 * Sentropic token structure.
 *
 * Every value below is MEASURED from the live workleap.com stylesheets. Workleap's
 * marketing site uses literal hex values in its brand CSS; the signature WORKLEAP
 * ELECTRIC BLUE (#2545FF — the most-used brand accent, ~26 occurrences) drives the
 * primary CTA and brand accent, a DEEP NAVY (#0C1754) carries the reversed dark
 * surface and the secondary-button ink, and an ACCENT ORANGE (#FF5B22) provides
 * the warm brand counterpoint. We reference the brand display + body face "Inter"
 * by NAME only, with a system-ui fallback chain, never font binaries. Sources and
 * the full mapping are in MAPPING.md; values not measured from a single source are
 * flagged "à confirmer".
 *
 * Workleap's identity is a CONFIDENT ELECTRIC-BLUE-ON-CREAM employee-experience
 * system: the WORKLEAP electric blue (#2545FF) is the primary action, link and
 * brand accent; a measured near-black ink (#171417) is the primary text; surfaces
 * are WHITE on a faint cream canvas (#F9F8F6); the reversed dark surface is a deep
 * navy (#0C1754); form fields are BOXED outlines (white fill, thin grey stroke,
 * modern radius). The focus indicator is a 2px electric-blue RING. Where Sentropic
 * needs a role Workleap does not publish, the closest measured hex is used and the
 * choice is noted "à confirmer" in MAPPING.md.
 *
 * Workleap colour reference (measured hex, brand CSS):
 *   Workleap electric blue (action / brand)  #2545FF   primary CTA / link / brand accent (~26× brand hex) — THE Workleap blue
 *   Electric blue hover / active             #1a36cc   darker blue on hover (à confirmer)
 *   Deep navy (dark surface / inverse)       #0C1754   reversed dark surface / secondary-button ink
 *   Accent orange                            #FF5B22   warm brand accent
 *   Ink near-black (text primary)            #171417   primary text + headings (measured ink)
 *   Secondary text                           #5d6c7b   secondary text / strong border (à confirmer)
 *   Muted text                               #758696   muted text
 *   White (surface default)                  #ffffff   surface default / CTA text
 *   Cream canvas (subtle surface)            #F9F8F6   faint cream page canvas (measured)
 *   Faint grey (secondary hover)             #ececec   secondary button hover (à confirmer)
 *   Field border / divider                   #c8c8c8   input stroke (1px, à confirmer)
 *   Success green                            #1f9d55   success feedback (AA on white, à confirmer)
 *   Warning amber ink                        #b26a00   warning feedback (AA-grade amber)
 *   Error / danger red                       #d72020   error feedback / danger (à confirmer)
 *   Info blue                                #2545FF   info feedback (electric blue, à confirmer)
 */

// --- WORKLEAP raw colour palette (measured hex, brand CSS) ------------------
const workleapColor = {
  // The brand accent IS the Workleap electric blue. Used for the brand mark, the
  // primary CTA, links and blue accents.
  blue: {
    500: "#2545FF", // primary CTA / link / brand accent (~26× brand hex) — THE Workleap blue
    600: "#1a36cc", // darker blue on hover/active (à confirmer)
    100: "#eaeeff" // faint blue tint (derived for soft fills — à confirmer)
  },
  // Deep navy — Workleap's reversed dark surface and secondary-button ink.
  navy: {
    900: "#0C1754" // deep navy: surface.inverse / secondary-button ink
  },
  // Accent orange — the warm brand counterpoint.
  orange: {
    500: "#FF5B22" // warm brand accent
  },
  // Neutral ink scale (Workleap never uses pure black for body text).
  ink: {
    default: "#171417", // primary text + headings — THE Workleap ink (measured)
    secondary: "#5d6c7b", // secondary text / strong border (à confirmer)
    muted: "#758696" // muted text
  },
  // Grey neutral scale (cream canvas + field/divider strokes).
  grey: {
    50: "#F9F8F6", // cream page canvas (subtle surface — measured)
    100: "#ececec", // secondary button hover (à confirmer)
    200: "#c8c8c8" // input stroke / divider (1px, à confirmer)
  },
  white: "#ffffff", // surface default / CTA text
  // System / status colours (à confirmer — AA-safe choices over the brand hues).
  system: {
    success: "#1f9d55", // success feedback (AA on white, à confirmer)
    warning: "#b26a00", // warning feedback (AA-grade amber)
    error: "#d72020", // error feedback / danger (à confirmer)
    info: "#2545FF" // info feedback (electric blue, à confirmer)
  }
} as const;

// --- foundation (WORKLEAP-specific values) ----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Workleap's PRIMARY
    // ACTION is the electric blue, so the action steps map to the blue scale; the
    // lightest step is the faint blue tint.
    blue: {
      10: workleapColor.blue[100], // #eaeeff faint blue tint
      60: workleapColor.blue[500], // #2545FF THE Workleap blue (primary action)
      80: workleapColor.blue[600] // #1a36cc deep blue (hover/active ground)
    },
    // Sentropic "cyan" accent slot. Workleap's warm accent is the orange; mapped
    // here so a distinct accent survives, plus the deep navy (à confirmer).
    cyan: {
      10: "#fff0ea", // faint orange tint (derived panel tint — à confirmer)
      50: workleapColor.orange[500], // #FF5B22 accent orange
      70: workleapColor.navy[900] // #0C1754 deep navy
    },
    // Sentropic "slate" neutral family mapped onto the Workleap ink and grey ramp.
    slate: {
      0: workleapColor.white, // #ffffff white
      10: workleapColor.grey[50], // #F9F8F6 cream canvas
      20: workleapColor.grey[200], // #c8c8c8 divider / subtle border
      60: workleapColor.ink.muted, // #758696 muted text
      80: workleapColor.ink.secondary, // #5d6c7b secondary text
      90: workleapColor.ink.default // #171417 strongest ink
    },
    feedback: {
      success: workleapColor.system.success,
      warning: workleapColor.system.warning,
      error: workleapColor.system.error,
      info: workleapColor.system.info
    }
  },
  // Workleap serves "Inter" (measured as the brand display + body face — Workleap
  // uses a proprietary highlight font; Inter is a close measured fallback) across
  // headings, body and UI, with a system-ui fallback. We reference the family
  // NAME only. Mono is not part of Workleap — the Sentropic ui-monospace stack is
  // kept.
  font: {
    sans: "'Inter', system-ui, sans-serif",
    display: "'Inter', system-ui, sans-serif",
    mono: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Workleap spacing: a 4/8px-based ramp aligned to the Sentropic step keys.
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
  // Workleap radii (à confirmer, modern): small chips 4px, controls/inputs 8px,
  // cards 12px, square 0, pill 999px for fully-rounded chips.
  radius: {
    none: "0", // square
    sm: "4px", // small chips (à confirmer)
    md: "8px", // controls / inputs (à confirmer)
    lg: "12px", // cards / larger surfaces (à confirmer)
    pill: "999px" // fully-rounded chips (à confirmer)
  },
  // Workleap elevation (à confirmer — mapped to the three Sentropic slots).
  shadow: {
    subtle: "0 1px 3px rgb(0 0 0 / 0.12)",
    medium: "0 4px 8px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.16), 0 2px 4px rgb(0 0 0 / 0.10)"
  },
  // Workleap transitions are short and standard; exact step ramp not separately
  // tokenised, kept aligned with the base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Workleap-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (WORKLEAP) ---------------------------------------
  // Workleap field/divider strokes measured at 1px solid #c8c8c8; strong borders
  // are the secondary ink #5d6c7b. thick 2px kept for emphasis.
  borderWidth: {
    none: "0",
    thin: "1px", // input + divider stroke
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Workleap control density. md targets a comfortable ~44px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Workleap typography = "Inter" across control labels, field text and labels.
  // Base type is 16px.
  typography: {
    control: { family: "'Inter', system-ui, sans-serif", size: "1rem", weight: "500", lineHeight: "1.125", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter', system-ui, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Workleap links: electric blue, underline on hover (à confirmer — anchors
    // resolve to the blue accent).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // Workleap disables controls at ≈ 40% (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // WORKLEAP FOCUS = a 2px electric-blue RING (#2545FF). The focus hue is the
  // brand electric blue; we encode the `ring` strategy at 2px.
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: workleapColor.blue[500], // #2545FF — electric-blue focus ring
    inset: "0"
  },
  // WORKLEAP form fields are BOXED (outline): a white fill with a thin grey stroke
  // (input `1px solid #c8c8c8`) at a modern 8px radius. `style: "outline"` makes
  // the builder draw four equal borders from `surface.default` + `border.subtle`.
  // The native <select> chevron is redrawn in the deep navy ink with a 36px right
  // gutter (appearance: none).
  field: {
    style: "outline",
    fillBg: workleapColor.white, // #ffffff
    underlineColor: workleapColor.grey[200], // #c8c8c8 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230C1754' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Workleap cards: white surface, modern rounded (12px), a soft grey border and a
  // faint cream hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: workleapColor.grey[50] // #F9F8F6 faint cream hover
  },
  // Workleap secondary button = a faint cream fill with deep-navy ink, darkening on
  // hover (measured secondary CTA).
  buttonSecondary: {
    background: workleapColor.grey[50], // #F9F8F6 faint cream fill
    border: workleapColor.grey[200], // #c8c8c8 subtle stroke
    hoverBackground: workleapColor.grey[100] // #ececec darker grey on hover (à confirmer)
  },
  // Workleap tabs / sub-nav: active tab = electric-blue label with a blue bottom
  // indicator (the brand accent bar), transparent fill.
  tabs: {
    activeText: workleapColor.blue[500], // #2545FF active label (brand blue)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // blue underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Workleap pagination: borderless blue link text; active page = filled electric
  // blue pill (the brand fill) with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: workleapColor.blue[500], // #2545FF link text
    activeBackground: workleapColor.blue[500], // #2545FF filled active page (brand blue)
    activeText: workleapColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Workleap breadcrumb: blue links, muted trail, near-black current page, muted
  // separators.
  breadcrumb: {
    linkText: workleapColor.blue[500], // #2545FF
    text: workleapColor.ink.muted, // #758696 trail text
    currentText: workleapColor.ink.default, // #171417 current page (near-black)
    separator: workleapColor.ink.muted, // #758696
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // Workleap notice / alert: a tinted box with a coloured left filet matching the
  // severity.
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
  // Workleap accordion / disclosure: a semibold near-black summary trigger, modern
  // rounded, grey-separated.
  accordion: {
    text: workleapColor.ink.default, // #171417 summary label (near-black)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600", // semibold triggers
    lineHeight: "1.5rem" // 24px
  },
  // Workleap tag: a small chip with a faint grey fill and navy ink.
  tag: {
    radius: "999px", // pill chips
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: workleapColor.grey[100], // #ececec faint grey fill
    neutralText: workleapColor.navy[900] // #0C1754 deep navy
  },
  // Workleap badge: a small filled badge — electric-blue fill / white text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: workleapColor.blue[500], // #2545FF brand blue
    infoText: workleapColor.white // white on blue
  },
  // Workleap checkbox/radio label: regular near-black type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: workleapColor.ink.default // #171417 near-black
  },
  // Workleap search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Workleap toggle / switch label: regular near-black type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: workleapColor.ink.default // #171417 near-black
  }
} as const;

// --- semantic (WORKLEAP-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: workleapColor.white, // #ffffff white
    subtle: workleapColor.grey[50], // #F9F8F6 cream canvas
    raised: workleapColor.white, // #ffffff white
    inverse: workleapColor.navy[900], // #0C1754 deep navy reversed surface
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop
  },
  text: {
    primary: workleapColor.ink.default, // #171417 near-black (primary text + headings)
    secondary: workleapColor.ink.secondary, // #5d6c7b secondary text
    muted: workleapColor.ink.muted, // #758696 muted text
    inverse: workleapColor.white, // white on dark/blue surfaces
    link: workleapColor.blue[500] // #2545FF electric-blue link
  },
  border: {
    subtle: workleapColor.grey[200], // #c8c8c8 divider / input stroke
    strong: workleapColor.ink.secondary, // #5d6c7b strong border
    interactive: workleapColor.blue[500] // #2545FF brand blue (interactive accent)
  },
  action: {
    primary: workleapColor.blue[500], // #2545FF THE Workleap electric-blue CTA
    primaryHover: workleapColor.blue[600], // #1a36cc blue hover/active
    primaryText: workleapColor.white, // white text on blue
    secondary: workleapColor.grey[50], // #F9F8F6 faint cream secondary surface
    secondaryHover: workleapColor.grey[100], // #ececec faint grey hover
    secondaryText: workleapColor.navy[900], // #0C1754 deep-navy secondary label
    danger: workleapColor.system.error // #d72020 danger red
  },
  feedback: {
    success: workleapColor.system.success, // #1f9d55
    warning: workleapColor.system.warning, // #b26a00
    error: workleapColor.system.error, // #d72020
    info: workleapColor.system.info // #2545FF
  },
  status: {
    pending: workleapColor.system.warning, // #b26a00
    processing: workleapColor.system.info, // #2545FF
    completed: workleapColor.system.success, // #1f9d55
    failed: workleapColor.system.error // #d72020
  },
  // Categorical data-vis palette. Workleap does not publish a single categorical
  // token list; the eight categories below are assembled from the measured brand
  // hexes (electric blue lead, accent orange, deep navy, secondary ink, greys,
  // success, amber) to give a legible brand-true scale. See MAPPING.md, "à
  // confirmer" — an assembled scale.
  data: {
    category1: workleapColor.blue[500], // #2545FF electric blue
    category2: workleapColor.orange[500], // #FF5B22 accent orange
    category3: workleapColor.navy[900], // #0C1754 deep navy
    category4: workleapColor.ink.secondary, // #5d6c7b secondary ink
    category5: workleapColor.blue[600], // #1a36cc deep blue
    category6: workleapColor.ink.muted, // #758696 muted grey
    category7: workleapColor.system.success, // #1f9d55 success green
    category8: workleapColor.system.warning // #b26a00 amber
  }
} as const;

/**
 * The WORKLEAP theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Workleap-specific (electric-blue-on-cream
 * employee-experience) values, and the `component` layer is REBUILT from this
 * theme's own semantic/foundation via `createComponent` — so Workleap's electric-
 * blue CTA, near-black ink, boxed fields and blue focus ring reach the components
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that read
 * semantic vars directly.
 */
export const workleapTheme: TenantTheme = {
  id: "workleap",
  label: "Workleap",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default workleapTheme;
