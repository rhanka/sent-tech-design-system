import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Renault brand theme for the Sentropic token structure.
 *
 * Renault (the French automaker, 2021 "Nouvelle Vague" identity — the
 * monochrome diamond) is a MONOCHROME brand: a single warm "Renault Yellow"
 * accent over black / anthracite and a neutral grey scale. The published brand
 * palette (brand.renault.com) is `#efdf00 / #ffffff / #000000 / #d9d9d6 /
 * #bbbcbc / #888b8d`; the corporate "black" used for type is the anthracite
 * Pantone 426 C `#191c1f`. We only reference font *names* (NouvelR / "Renault
 * Group" — the brand's custom typeface by Black[Foundry], 2021) here, never
 * font binaries. Sources and exact provenance are in MAPPING.md; every value
 * Renault does not publish (the full neutral scale, system/feedback hues, hover
 * tints, radii, focus spec) is flagged "à confirmer".
 *
 * ACCESSIBILITY — the yellow primary. Renault Yellow `#efdf00` is a vivid light
 * yellow: it FAILS WCAG AA as text on white, but PASSES with high contrast as a
 * BUTTON FILL carrying BLACK text — exactly how the brand uses it. So this
 * theme wires `action.primary = #efdf00` with `action.primaryText = #000000`
 * (black on yellow, like the brand), and deliberately routes every *text/line*
 * interactive role — `text.link`, `border.interactive`, `focus.color` — to the
 * anthracite `#191c1f` (readable monochrome), NOT the yellow. These choices are
 * documented under "À confirmer" in MAPPING.md.
 *
 * Renault colour reference (light theme):
 *   White (background default)         #ffffff   (brand.renault.com — white)
 *   Light grey (light bg, derived)     #f5f5f3   (derived — à confirmer)
 *   Light grey (Renault Light Grey)    #d9d9d6   (brand.renault.com — light grey)
 *   Medium grey (Renault Medium Grey)  #bbbcbc   (brand.renault.com — medium grey)
 *   Dark grey (Renault Dark Grey)      #888b8d   (brand.renault.com — dark grey)
 *   Secondary text (derived)           #5a5d5f   (derived darker grey — à confirmer)
 *   Anthracite (corporate "black")     #191c1f   (Pantone 426 C — text / lines)
 *   Black                              #000000   (brand.renault.com — black)
 *   Renault Yellow (brand accent)      #efdf00   (brand.renault.com — Renault Yellow)
 *   Yellow hover (derived gold)        #d4c400   (derived darker gold — à confirmer)
 *   Deep gold (derived accent)         #b89e00   (derived — à confirmer)
 */

// --- Renault raw colour palette (brand.renault.com) ------------------------
const renaultColor = {
  // Renault Yellow — the single warm brand accent (in use since 1946, carried
  // into the 2021 identity). Primary action fill (with BLACK text), tab/active
  // indicator, highlight. NOT used for text/links on white (fails WCAG AA).
  yellow: {
    main: "#efdf00", // brand.renault.com — Renault Yellow (primary brand accent)
    light: "#fdf6b8", // derived light yellow tint (à confirmer)
    dark: "#d4c400", // derived darker gold for button hover/active (à confirmer)
    deep: "#b89e00" // derived deep gold accent (à confirmer)
  },
  // Monochrome core — black + the corporate anthracite (Pantone 426 C).
  black: "#000000", // brand.renault.com — Renault Black (logo, inverse surfaces)
  anthracite: "#191c1f", // official corporate "black", Pantone 426 C — body text / lines
  // Neutral grey scale: 3 published Renault greys + derived light bg / secondary.
  grey: {
    0: "#ffffff", // brand.renault.com — white (surface default)
    50: "#f5f5f3", // derived light background tint (à confirmer)
    200: "#d9d9d6", // brand.renault.com — Renault Light Grey (subtle border)
    300: "#bbbcbc", // brand.renault.com — Renault Medium Grey
    500: "#888b8d", // brand.renault.com — Renault Dark Grey (muted text / strong border)
    700: "#5a5d5f" // derived darker grey for secondary text — AA on white (à confirmer)
  },
  // System / status colours. Renault does NOT publish a UI system palette, so
  // these are derived to keep WCAG AA on white (à confirmer).
  system: {
    success: "#1f7a3d", // derived green (à confirmer)
    warning: "#b35900", // derived amber, darkened for AA on white (à confirmer)
    error: "#c62828", // derived red, AA on white (à confirmer)
    info: "#1565c0" // derived neutral info blue (à confirmer)
  }
} as const;

// --- foundation (Renault-specific values) ----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family carries Renault's PRIMARY accent — the
    // Renault Yellow scale (light tint → yellow → darker gold).
    blue: {
      10: renaultColor.yellow.light, // light yellow tint
      60: renaultColor.yellow.main, // #efdf00 Renault Yellow (primary)
      80: renaultColor.yellow.dark // #d4c400 darker gold
    },
    // Renault is monochrome and has NO second brand colour; the Sentropic
    // "cyan" accent slot is parked on a derived deep-gold variant of the yellow
    // family (data-vis / gradient only) — à confirmer.
    cyan: {
      10: renaultColor.yellow.light, // light yellow tint
      50: renaultColor.yellow.deep, // #b89e00 deep gold accent (à confirmer)
      70: "#8a7600" // darker gold (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the Renault grey scale + black.
    slate: {
      0: renaultColor.grey[0], // white
      10: renaultColor.grey[50], // light background
      20: renaultColor.grey[200], // subtle border (Renault Light Grey)
      60: renaultColor.grey[700], // secondary text (derived)
      80: renaultColor.anthracite, // #191c1f primary text (corporate black)
      90: renaultColor.black // #000000 darkest
    },
    feedback: {
      success: renaultColor.system.success,
      warning: renaultColor.system.warning,
      error: renaultColor.system.error,
      info: renaultColor.system.info
    }
  },
  // Renault's custom typeface is "NouvelR" (a.k.a. the "Renault Group" webfont),
  // designed by Black[Foundry] in 2021 for the brand's digital + offline use.
  // Display and body both use it; mono falls back to the system stack. We
  // reference the font *names* only, never the binaries.
  font: {
    sans: "'NouvelR', 'Renault Group', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'NouvelR', 'Renault Group', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity).
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
  // Renault's identity is GEOMETRIC and ANGULAR (the diamond, the "r" cut at
  // 28°): controls carry a near-square 2px radius, cards a restrained 4px.
  // Exact radii are not published (à confirmer).
  radius: {
    none: "0",
    sm: "0.125rem", // 2px
    md: "0.125rem", // 2px — button / input / tabs (angular)
    lg: "0.25rem", // 4px — cards
    pill: "999px" // tags / pills
  },
  // Neutral elevation tinted with the brand anthracite. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(25 28 31 / 0.10)",
    medium: "0 4px 12px rgb(25 28 31 / 0.14)",
    floating: "0 8px 24px rgb(25 28 31 / 0.18)"
  },
  // Motion durations are not tokenised by Renault publicly; kept aligned with
  // the Sentropic base ("à confirmer").
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
  // --- Anatomy primitives (Renault) ----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border 1px
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. ~40px medium controls with 0.75rem inline padding. sm/lg
  // follow the standard size scale ("à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.625rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Renault typography: NouvelR for interactive/fields/labels and display
  // titles. Button labels use NouvelR (weight 600), no transform.
  typography: {
    control: { family: "'NouvelR', 'Renault Group', system-ui, sans-serif", size: "1rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'NouvelR', 'Renault Group', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'NouvelR', 'Renault Group', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Links are anthracite #191c1f (NOT the yellow), not underlined at rest,
    // underlined on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // disabled controls dim to 0.5 (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a high-contrast ANTHRACITE outline (NOT yellow — a yellow ring on
  // white would be near-invisible). Monochrome, accessible. Spec not published
  // by Renault ("à confirmer").
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: renaultColor.anthracite, // #191c1f anthracite focus outline
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px grey border (#d9d9d6)
  // and a near-square 2px radius. `style: "outline"` makes the builder draw
  // four equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: renaultColor.grey[0], // #ffffff
    underlineColor: renaultColor.grey[500], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in anthracite (monochrome, not yellow)
    // with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23191c1f' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + slight radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: renaultColor.grey[50] // #f5f5f3
  },
  // Secondary button = OUTLINED in anthracite: transparent fill, anthracite
  // border + text, light grey fill on hover (Renault's monochrome secondary).
  buttonSecondary: {
    background: "transparent",
    border: renaultColor.anthracite, // #191c1f stroke
    hoverBackground: renaultColor.grey[50] // #f5f5f3 light fill on hover
  },
  // Tabs / top-nav: active tab = bold ANTHRACITE label with a bottom YELLOW
  // underline (the brand accent as indicator — the underline colour is derived
  // from action.primary = Renault Yellow by createComponent).
  tabs: {
    activeText: renaultColor.anthracite, // #191c1f bold black label
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: borderless anthracite links; active page = filled Renault
  // Yellow with black text (derived from action.primary / primaryText).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: renaultColor.anthracite, // #191c1f link text
    activeBackground: renaultColor.yellow.main, // #efdf00 filled active page
    activeText: renaultColor.black, // #000000 black on yellow
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: anthracite links, dark current page, grey separators.
  breadcrumb: {
    linkText: renaultColor.anthracite, // #191c1f
    text: renaultColor.grey[500], // #888b8d trail text
    currentText: renaultColor.anthracite, // #191c1f current page
    separator: renaultColor.grey[500], // #888b8d
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700"
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
    text: renaultColor.anthracite, // #191c1f summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: a small near-square 2px-radius grey chip.
  tag: {
    radius: "2px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: renaultColor.grey[50], // #f5f5f3
    neutralText: renaultColor.anthracite // #191c1f
  },
  // Badge: a near-square 2px-radius filled badge.
  badge: {
    radius: "2px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: renaultColor.anthracite, // #191c1f (monochrome info badge)
    infoText: renaultColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: renaultColor.anthracite // #191c1f
  },
  // Search input.
  search: {
    paddingBlock: "0.375rem", // 6px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: renaultColor.anthracite // #191c1f
  }
} as const;

// --- semantic (Renault-specific role mapping) ------------------------------
const semantic = {
  surface: {
    default: renaultColor.grey[0], // white
    subtle: renaultColor.grey[50], // #f5f5f3 light background
    raised: renaultColor.grey[0], // white
    inverse: renaultColor.black, // #000000 Renault black inverse surface (bold dark sections)
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop (black tint)
  },
  text: {
    primary: renaultColor.anthracite, // #191c1f corporate black body text (Pantone 426 C)
    secondary: renaultColor.grey[700], // #5a5d5f (derived — à confirmer)
    muted: renaultColor.grey[500], // #888b8d Renault Dark Grey
    inverse: renaultColor.grey[0], // white on dark / coloured surfaces
    // Links are anthracite, NOT the yellow (yellow text fails WCAG AA on white).
    link: renaultColor.anthracite // #191c1f
  },
  border: {
    subtle: renaultColor.grey[200], // #d9d9d6 Renault Light Grey
    strong: renaultColor.grey[500], // #888b8d Renault Dark Grey
    // Interactive / focus border is anthracite (monochrome), NOT the yellow.
    interactive: renaultColor.anthracite // #191c1f
  },
  action: {
    // PRIMARY = Renault Yellow fill with BLACK text — the brand's signature
    // button. Yellow as a fill + black text clears WCAG AA with high contrast.
    primary: renaultColor.yellow.main, // #efdf00 Renault Yellow
    primaryHover: renaultColor.yellow.dark, // #d4c400 darker gold (à confirmer)
    primaryText: renaultColor.black, // #000000 black text on yellow
    secondary: renaultColor.grey[50], // #f5f5f3 secondary surface
    secondaryHover: renaultColor.grey[200], // #d9d9d6
    secondaryText: renaultColor.anthracite, // #191c1f
    danger: renaultColor.system.error // #c62828 error red (à confirmer)
  },
  feedback: {
    success: renaultColor.system.success,
    warning: renaultColor.system.warning,
    error: renaultColor.system.error,
    info: renaultColor.system.info
  },
  status: {
    pending: renaultColor.system.warning,
    processing: renaultColor.system.info,
    completed: renaultColor.system.success,
    failed: renaultColor.system.error
  },
  // Categorical data-vis palette built from the brand hues. Renault is
  // monochrome (yellow + black/grey) and publishes no 8-colour scale, so this
  // is a coherent proposal — yellow-led, with the derived system hues for
  // variety (see MAPPING.md, "à confirmer").
  data: {
    category1: renaultColor.yellow.main, // #efdf00 Renault Yellow
    category2: renaultColor.anthracite, // #191c1f anthracite
    category3: renaultColor.grey[500], // #888b8d Renault Dark Grey
    category4: renaultColor.yellow.deep, // #b89e00 deep gold
    category5: renaultColor.system.info, // #1565c0 info blue
    category6: renaultColor.system.success, // #1f7a3d green
    category7: renaultColor.system.error, // #c62828 red
    category8: renaultColor.grey[300] // #bbbcbc Renault Medium Grey
  }
} as const;

/**
 * The Renault theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Renault-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Renault brand (yellow primary + black text,
 * anthracite lines, angular radii) reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const renaultTheme: TenantTheme = {
  id: "renault",
  label: "Renault",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default renaultTheme;
