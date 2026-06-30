import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Stability AI theme for the Sentropic token structure.
 *
 * All values below are measured from Stability AI's PUBLIC website
 * (https://stability.ai — a Squarespace build). The site ships a Squarespace
 * colour "kit" whose palette resolves to a DEEP-VIOLET-on-near-black identity:
 *   --accent-hsl: 270,100%,20%   → #330066  (the signature deep violet)
 *   --black-hsl:  0,0%,12%       → #1f1f1f  (the near-black stage)
 *   --white-hsl:  150,4%,90.2%   → #e5e7e6  (off-white ink / light surface)
 *   --lightAccent-hsl: 0,0%,80%  → #cccccc  (light grey)
 *   --darkAccent-hsl:  0,0%,100% → #ffffff  (white)
 * On top of that the page DOM carries a brighter brand violet #a381ff (the
 * legible on-dark lavender accent/glow), a deep violet #340068 (≈ the --accent),
 * and a muted purple #725d91. The hero and dominant chrome render on the
 * near-black stage with off-white text, so this is a DARK theme: mode:"dark".
 *
 * Typography is measured from the Google Fonts the site loads and its
 * Squarespace font tweaks: "Archivo" (400/700 + italics) is the heading AND
 * body face (--heading-font / --body-font = "Archivo"), and "Figtree" 600 is
 * the button face (--primary/secondary/tertiary-button-font = "Figtree"). Only
 * font *names* are referenced here, never binaries.
 *
 * Where Sentropic needs a role Stability does not publish (success/error/info
 * hues, the full 8-step data-vis scale, the dark surface lifts, the exact focus
 * technique), the closest measured token is used or a value is derived, and the
 * choice is flagged "à confirmer" in MAPPING.md.
 *
 * Stability AI colour reference (measured + derived, dark theme):
 *   Near-black stage (--black)         #1f1f1f   --black-hsl 0,0%,12% (≈ DOM #1e1e1e)
 *   Lifted dark surface                #272727   measured form submit background
 *   Off-white ink (--white)            #e5e7e6   --white-hsl 150,4%,90.2%
 *   Light grey (--lightAccent)         #cccccc   --lightAccent-hsl 0,0%,80%
 *   Mid grey (muted ink)               #888888   measured DOM
 *   Bright brand violet (on-dark CTA)  #a381ff   measured DOM (lavender accent)
 *   Deep violet (--accent)             #340068   measured DOM ≈ --accent #330066
 *   Muted purple                       #725d91   measured DOM
 *   White (--darkAccent)               #ffffff   --darkAccent-hsl 0,0%,100%
 */

// --- Stability AI raw colour palette (public Squarespace kit + DOM) ----------
const stabilityColor = {
  // The brand VIOLET. `bright` is the legible on-dark lavender (the interactive
  // accent / glow); `deep` is the Squarespace --accent deep violet; `muted` is a
  // measured mid purple. `tint`/`hover` are derived (à confirmer).
  violet: {
    bright: "#a381ff", // measured DOM — bright lavender, the on-dark brand accent / CTA
    deep: "#340068", // measured DOM deep violet ≈ --accent hsl(270,100%,20%) (#330066)
    muted: "#725d91", // measured DOM — muted mid purple
    tint: "#c9b3ff", // light lavender tint (derived — à confirmer)
    hover: "#b89cff" // brighter lavender hover (derived — à confirmer)
  },
  // Neutral ramp: the near-black stage + off-white ink. `grey`/`raised`/`border`/
  // `borderStrong` are the dark surface lifts (grey is measured; the rest derived).
  neutral: {
    white: "#ffffff", // --darkAccent — pure white
    offWhite: "#e5e7e6", // --white hsl(150,4%,90.2%) — off-white ink / light surface
    light: "#cccccc", // --lightAccent hsl(0,0%,80%) — light grey (secondary ink)
    mid: "#888888", // measured DOM — mid grey (muted ink)
    grey: "#272727", // measured form submit background — lifted dark surface
    raised: "#2e2e2e", // raised dark surface (derived — à confirmer)
    border: "#3a3a3a", // subtle divider on dark (derived — à confirmer)
    borderStrong: "#555555", // strong border on dark (derived — à confirmer)
    stage: "#1f1f1f" // --black hsl(0,0%,12%) — the near-black stage (≈ DOM #1e1e1e)
  },
  // System / status colours. Stability publishes none; these are derived to sit
  // AA-legibly on the #1f1f1f stage (à confirmer).
  system: {
    success: "#3fb950", // green, AA on dark (derived — à confirmer)
    warning: "#e3a008", // amber (derived — à confirmer)
    error: "#f0616d", // red, AA on dark (derived — à confirmer)
    info: "#5b8def" // blue (derived — à confirmer)
  }
} as const;

// --- foundation (Stability AI-specific values) -------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Stability brand violet.
    blue: {
      10: stabilityColor.violet.tint, // #c9b3ff light lavender tint
      60: stabilityColor.violet.bright, // #a381ff bright brand violet (primary)
      80: stabilityColor.violet.deep // #340068 deep violet (darker interactive)
    },
    // Stability has no cyan; the closest non-primary accent is the deep / muted
    // violet, so the Sentropic "cyan" accent slot maps to the violet family.
    cyan: {
      10: stabilityColor.violet.tint, // #c9b3ff light lavender tint (à confirmer)
      50: stabilityColor.violet.muted, // #725d91 muted purple
      70: stabilityColor.violet.deep // #340068 deep violet (--accent)
    },
    // Sentropic "slate" neutral family mapped onto the dark stage + off-white ink
    // (dark-first: 0 is the lightest ink, 90 is the near-black stage).
    slate: {
      0: stabilityColor.neutral.white, // #ffffff (lightest)
      10: stabilityColor.neutral.offWhite, // #e5e7e6 off-white ink
      20: stabilityColor.neutral.light, // #cccccc light grey
      60: stabilityColor.neutral.mid, // #888888 mid grey
      80: stabilityColor.neutral.grey, // #272727 lifted dark surface
      90: stabilityColor.neutral.stage // #1f1f1f near-black stage (darkest)
    },
    feedback: {
      success: stabilityColor.system.success,
      warning: stabilityColor.system.warning,
      error: stabilityColor.system.error,
      info: stabilityColor.system.info
    }
  },
  // Stability uses "Archivo" for headings AND body (Squarespace --heading-font /
  // --body-font = "Archivo"), and "Figtree" 600 for buttons. Mono is not used on
  // the site → a neutral monospace stack (à confirmer). Font *names* only.
  font: {
    sans: "'Archivo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    display: "'Archivo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace"
  },
  // Standard 4px-based rem spacing scale (Squarespace uses a fluid grid with no
  // published base unit; the Sentropic 4px grid is kept — à confirmer).
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
  // Stability rounding: form fields 5px, secondary buttons 10px, cards 14px, and
  // the signature primary CTA is a 30px PILL. (Measured Squarespace button/field
  // shape tweaks.)
  radius: {
    none: "0",
    sm: "5px", // form fields (--form-field-shape-radius: 5px)
    md: "10px", // default control / secondary button (10px)
    lg: "14px", // cards (measured)
    pill: "999px" // primary CTA reads as a pill (30px on a ~48px control)
  },
  // Dark elevation: deep, near-black shadows over the near-black stage. Exact
  // specs not published (à confirmer).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.50)",
    medium: "0 4px 16px rgb(0 0 0 / 0.55)",
    floating: "0 8px 32px rgb(0 0 0 / 0.65)"
  },
  // Motion durations / easing are not Stability-specific; kept aligned with base.
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Stability-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Stability AI) -----------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // form fields / dividers (--form-field-border-thickness: 1px)
    thick: "2px" // focus ring / emphasis
  },
  borderStyle: { solid: "solid" },
  // Control density. Stability buttons carry generous padding (1rem / 1.3rem),
  // giving a tall md control (~48px); sm/lg follow proportionally.
  density: {
    sm: { controlHeight: "2.5rem", paddingBlock: "0.625rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "0.875rem" },
    md: { controlHeight: "3rem", paddingBlock: "1rem", paddingInline: "1.3rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1rem" },
    lg: { controlHeight: "3.5rem", paddingBlock: "1.25rem", paddingInline: "1.75rem", gap: "0.625rem", minWidth: "3.5rem", fontSize: "1.125rem" }
  },
  // Type roles: "Figtree" 600 for interactive controls/buttons (the measured
  // button face), UPPERCASE like the primary CTA; "Archivo" for fields and
  // labels (the body face). Links are not coloured at rest on the live site
  // (plain white/black); underline appears on hover.
  typography: {
    control: { family: "'Figtree', 'Archivo', system-ui, sans-serif", size: "1rem", weight: "600", lineHeight: "1.2", letterSpacing: "0", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Archivo', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Archivo', system-ui, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // disabled state opacity (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow, outline-color", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // FOCUS = a soft RING in the bright brand violet around the box (the most
  // legible indicator on the near-black stage). Exact focus technique not
  // published (à confirmer).
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: stabilityColor.violet.bright, // #a381ff bright brand violet ring
    inset: "0"
  },
  // Form fields are BOXED (outline): a dark input surface, a 1px border and a
  // crisp 5px radius (measured --form-field-shape-radius 5px / border 1px). The
  // border / ring turns violet on focus. The native <select> chevron is redrawn
  // in the bright brand violet.
  field: {
    style: "outline",
    fillBg: stabilityColor.neutral.grey, // #272727 dark input surface on the stage
    underlineColor: stabilityColor.neutral.border, // #3a3a3a (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23a381ff' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Card: a subtle dark surface lift on the stage, a 1px border, faint hover lift.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: stabilityColor.neutral.raised // #2e2e2e faint lift on the dark card
  },
  // Secondary button (Stability secondary = boxed 10px): transparent fill, a 1px
  // border, a quiet dark fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: stabilityColor.neutral.borderStrong, // #555555 stroke on the dark stage
    hoverBackground: stabilityColor.neutral.grey // #272727 quiet fill on hover
  },
  // Tabs: active tab = bright violet label with a 2px violet bottom indicator.
  tabs: {
    activeText: stabilityColor.violet.bright, // #a381ff
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    lineHeight: "1.25rem", // 20px
    indicatorSide: "bottom", // indicator on the bottom edge
    indicatorMode: "border" // a real 2px bottom border
  },
  // Pagination: borderless light links on the dark stage; active page = filled
  // bright violet with the dark stage as text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: stabilityColor.neutral.light, // #cccccc link text on dark
    activeBackground: stabilityColor.violet.bright, // #a381ff filled active page
    activeText: stabilityColor.neutral.stage, // #1f1f1f dark text on violet
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem" // 20px
  },
  // Breadcrumb: violet links, light trail, off-white current page, mid separators.
  breadcrumb: {
    linkText: stabilityColor.violet.bright, // #a381ff
    text: stabilityColor.neutral.light, // #cccccc trail text
    currentText: stabilityColor.neutral.offWhite, // #e5e7e6 current page
    separator: stabilityColor.neutral.mid, // #888888
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600"
  },
  // Notice / alert: a coloured LEFT accent filet on a transparent box.
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
    lineHeight: "1.5rem" // 24px
  },
  // Accordion / disclosure: an off-white summary trigger on the dark stage.
  accordion: {
    text: stabilityColor.neutral.offWhite, // #e5e7e6 summary label
    paddingBlock: "0.875rem", // 14px
    paddingInline: "1rem", // 16px
    fontSize: "0.9375rem", // 15px
    fontWeight: "600",
    lineHeight: "1.5rem" // 24px
  },
  // Tag / chip: a subtle dark chip — a lifted fill with light ink, 8px radius
  // (Stability chip radius à confirmer).
  tag: {
    radius: "8px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "0.8125rem", // 13px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.75rem", // 28px
    neutralBackground: stabilityColor.neutral.grey, // #272727 dark chip fill
    neutralText: stabilityColor.neutral.light // #cccccc light ink
  },
  // Badge: a small filled badge — bright violet fill / dark stage text.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: stabilityColor.violet.bright, // #a381ff
    infoText: stabilityColor.neutral.stage // #1f1f1f dark text on violet
  },
  // Checkbox/radio label: off-white ink at base size on the dark stage.
  choice: {
    labelFontSize: "0.9375rem", // 15px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: stabilityColor.neutral.offWhite // #e5e7e6 label ink on dark
  },
  // Search input: a boxed field on the dark stage, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Toggle / switch label: off-white ink; the checked track is the violet accent.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: stabilityColor.neutral.offWhite // #e5e7e6
  }
} as const;

// --- semantic (Stability AI role mapping, DARK-first) ------------------------
const semantic = {
  surface: {
    default: stabilityColor.neutral.stage, // #1f1f1f the near-black stage (--black)
    subtle: stabilityColor.neutral.grey, // #272727 lifted dark surface (measured submit bg)
    raised: stabilityColor.neutral.raised, // #2e2e2e raised surface (derived)
    inverse: stabilityColor.neutral.offWhite, // #e5e7e6 off-white inverse surface (--white)
    overlay: "rgb(31 31 31 / 0.70)" // modal backdrop — the stage at .7
  },
  text: {
    primary: stabilityColor.neutral.offWhite, // #e5e7e6 off-white ink (--white)
    secondary: stabilityColor.neutral.light, // #cccccc secondary ink (--lightAccent)
    muted: stabilityColor.neutral.mid, // #888888 muted / placeholder ink
    inverse: stabilityColor.neutral.stage, // #1f1f1f dark text on light / violet surfaces
    link: stabilityColor.violet.bright // #a381ff brand violet link (live links plain — à confirmer)
  },
  border: {
    subtle: stabilityColor.neutral.border, // #3a3a3a subtle divider on dark (derived)
    strong: stabilityColor.neutral.borderStrong, // #555555 stronger border (derived)
    interactive: stabilityColor.violet.bright // #a381ff violet interactive / focus accent
  },
  action: {
    primary: stabilityColor.violet.bright, // #a381ff the bright violet CTA (on-dark accent)
    primaryHover: stabilityColor.violet.hover, // #b89cff brighter violet on hover (derived)
    primaryText: stabilityColor.neutral.stage, // #1f1f1f dark stage text on the violet CTA
    secondary: stabilityColor.neutral.grey, // #272727 neutral secondary surface
    secondaryHover: stabilityColor.neutral.raised, // #2e2e2e
    secondaryText: stabilityColor.neutral.offWhite, // #e5e7e6 off-white secondary label
    danger: stabilityColor.system.error // #f0616d (derived)
  },
  feedback: {
    success: stabilityColor.system.success, // #3fb950 (derived)
    warning: stabilityColor.system.warning, // #e3a008 (derived)
    error: stabilityColor.system.error, // #f0616d (derived)
    info: stabilityColor.system.info // #5b8def (derived)
  },
  status: {
    pending: stabilityColor.system.warning, // #e3a008
    processing: stabilityColor.system.info, // #5b8def
    completed: stabilityColor.system.success, // #3fb950
    failed: stabilityColor.system.error // #f0616d
  },
  // Categorical data-vis palette. Stability publishes no 8-step data-vis scale,
  // so this is a coherent, violet-led proposal (see MAPPING.md, "à confirmer")
  // built from the measured violet family + derived system hues.
  data: {
    category1: stabilityColor.violet.bright, // #a381ff bright violet
    category2: stabilityColor.violet.deep, // #340068 deep violet (--accent)
    category3: stabilityColor.violet.muted, // #725d91 muted purple
    category4: stabilityColor.system.info, // #5b8def blue (derived)
    category5: stabilityColor.system.success, // #3fb950 green (derived)
    category6: stabilityColor.system.warning, // #e3a008 amber (derived)
    category7: stabilityColor.system.error, // #f0616d red (derived)
    category8: stabilityColor.neutral.light // #cccccc light grey (derived)
  }
} as const;

/**
 * The Stability AI theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Stability-specific (deep-violet-
 * on-near-black, dark-first, Archivo body / Figtree button, pill-CTA) values,
 * and the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so the Stability violet, dark surfaces, Figtree
 * controls, 5px boxed fields and violet focus ring reach the components
 * (buttons, tabs, pagination, chat bubbles…), not just the elements that read
 * semantic vars directly. `mode:"dark"` because the dominant chrome renders on
 * the near-black #1f1f1f stage.
 */
export const stabilityTheme: TenantTheme = {
  id: "stability",
  label: "Stability AI",
  mode: "dark",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default stabilityTheme;
