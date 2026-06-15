import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * DOLLARAMA (dollarama.com — the Montréal-HQ discount-retail chain) theme for the
 * Sentropic token structure.
 *
 * Dollarama's identity is a GREEN-AND-YELLOW DISCOUNT-RETAIL system: a deep
 * DOLLARAMA GREEN (#006C46 — the brand green, measured from dollarama.com CSS)
 * drives every primary CTA, link, brand accent and the reversed surface; a
 * signature SIGNAGE YELLOW (#FFE71E — measured, the in-store/price-tag yellow)
 * with BLACK text is the highlight / secondary-CTA chip, with a warmer GOLD
 * (#FFD700) as a companion accent; ink is a near-black #2F2F2F on white surfaces
 * with a pale-green #E8F5E9 page tint. The green, yellow, gold and ink below are
 * MEASURED from dollarama.com's stylesheets; the secondary text, radii, the
 * status/feedback hues and the green hover are DERIVED and flagged "à confirmer"
 * in MAPPING.md.
 *
 * Form fields are BOXED outlines (white fill, thin grey #C4C4C4 stroke); focus is
 * a 2px green outline in the brand green #006C46. Typography is a clean retail
 * sans (the Open Sans / Arial family — names only, à confirmer for the exact
 * @font-face). Where Sentropic needs a role Dollarama does not publish, the
 * closest measured hex is used and the choice is noted "à confirmer" in
 * MAPPING.md.
 *
 * Dollarama colour reference (measured from dollarama.com CSS, derived noted):
 *   Brand green (action / brand / link)  #006C46   measured brand green — THE Dollarama green
 *   Brand green hover / active           #004d33   darker green on hover (à confirmer)
 *   Signature yellow (CTA / highlight)   #FFE71E   measured signage yellow (black text)
 *   Gold accent (companion)              #FFD700   measured gold accent / warning
 *   Yellow hover                         #f0d800   darker yellow on hover (à confirmer)
 *   Near-black ink (text primary)        #2F2F2F   measured primary ink
 *   Secondary text                       #555555   secondary text (à confirmer)
 *   Muted text                           #C4C4C4   muted text / subtle border
 *   White (surface default)              #ffffff   surface default / raised / CTA text
 *   Subtle surface (pale green)          #E8F5E9   measured pale-green page tint
 *   Field border / divider               #C4C4C4   subtle border
 *   Success green                        #006C46   feedback success (brand green)
 *   Warning gold                         #FFD700   feedback warning (gold accent)
 *   Error red                            #d32f2f   feedback error (à confirmer)
 *   Info blue                            #2f80ed   feedback info (à confirmer)
 */

// --- DOLLARAMA raw colour palette (measured hex from dollarama.com CSS) -------
const dollaramaColor = {
  // The brand IS the Dollarama green. Used for the brand mark, every primary CTA,
  // links, green accents and the reversed surface. (measured brand green)
  green: {
    500: "#006C46", // measured Dollarama brand green — THE Dollarama green
    600: "#004d33", // darker green on hover/active (à confirmer)
    100: "#E8F5E9" // measured pale-green page tint / soft fills
  },
  // Signature yellow from in-store signage / price tags — the highlight + the
  // secondary CTA chip (always paired with BLACK text). (measured)
  yellow: {
    500: "#FFE71E", // measured signage yellow (highlight / secondary CTA)
    600: "#f0d800" // darker yellow on hover/active (à confirmer)
  },
  // Warmer gold companion accent (measured) — feedback.warning + decorative.
  gold: {
    500: "#FFD700" // measured gold accent / warning
  },
  // Neutral ink scale (Dollarama body ink is a near-black, not pure black).
  ink: {
    default: "#2F2F2F", // measured primary ink
    secondary: "#555555", // secondary text (à confirmer)
    muted: "#C4C4C4" // muted text / subtle border
  },
  // Grey neutral scale (field/divider strokes).
  grey: {
    200: "#C4C4C4" // subtle border / divider / muted
  },
  white: "#ffffff", // surface default / raised / CTA text
  // System / status colours (success/warning are brand hues; error/info derived).
  system: {
    success: "#006C46", // feedback success (brand green)
    warning: "#FFD700", // feedback warning (gold accent)
    error: "#d32f2f", // feedback error (à confirmer)
    info: "#2f80ed" // feedback info (à confirmer, AA-safe)
  }
} as const;

// --- foundation (DOLLARAMA-specific values) ---------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Dollarama's PRIMARY
    // ACTION is GREEN, so the action steps are mapped to the green scale; the
    // lightest step is the pale-green tint.
    blue: {
      10: dollaramaColor.green[100], // #E8F5E9 pale-green tint
      60: dollaramaColor.green[500], // #006C46 THE Dollarama green (primary action)
      80: dollaramaColor.green[600] // #004d33 deep green (hover/active ground)
    },
    // Sentropic "cyan" accent slot. Dollarama's warm accent is the signage yellow;
    // mapped here so a distinct accent survives.
    cyan: {
      10: "#fffce0", // faint yellow tint (derived — à confirmer)
      50: dollaramaColor.yellow[500], // #FFE71E signage yellow accent
      70: dollaramaColor.gold[500] // #FFD700 gold companion
    },
    // Sentropic "slate" neutral family mapped onto the Dollarama ink and grey ramp.
    slate: {
      0: dollaramaColor.white, // #ffffff white
      10: dollaramaColor.green[100], // #E8F5E9 pale-green page tint
      20: dollaramaColor.grey[200], // #C4C4C4 divider / subtle border
      60: dollaramaColor.ink.secondary, // #555555 secondary text
      80: dollaramaColor.ink.default, // #2F2F2F primary ink
      90: dollaramaColor.ink.default // #2F2F2F strongest ink
    },
    feedback: {
      success: dollaramaColor.system.success,
      warning: dollaramaColor.system.warning,
      error: dollaramaColor.system.error,
      info: dollaramaColor.system.info
    }
  },
  // Dollarama's site is a clean retail sans. The exact @font-face family is NOT
  // sourced; we reference Open Sans / Arial by NAME only (à confirmer). Mono is
  // not part of Dollarama — the Sentropic mono stack is kept.
  font: {
    sans: "'Open Sans', Arial, Helvetica, sans-serif",
    display: "'Open Sans', Arial, Helvetica, sans-serif",
    mono: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Dollarama spacing: a standard 4/8px-based ramp aligned to the Sentropic step
  // keys (exact paddings not separately tokenised — "à confirmer").
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
  // Dollarama radii (à confirmer): mildly rounded retail controls. md 4px for
  // controls, lg 8px for cards, sm 2px for chips.
  radius: {
    none: "0",
    sm: "2px", // small chips (à confirmer)
    md: "4px", // controls / inputs (à confirmer)
    lg: "8px", // cards / larger surfaces (à confirmer)
    pill: "999px" // fully-rounded pill (tags / badges)
  },
  // Dollarama elevation (à confirmer — mapped to the three Sentropic slots from a
  // standard light-surface elevation ramp).
  shadow: {
    subtle: "0 1px 3px rgb(0 0 0 / 0.12)",
    medium: "0 4px 8px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.16), 0 2px 4px rgb(0 0 0 / 0.10)"
  },
  // Dollarama transitions (à confirmer — kept aligned with the base).
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Dollarama-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (DOLLARAMA) --------------------------------------
  // Dollarama field/divider strokes 1px solid #C4C4C4; brand accent borders 1px
  // #006C46. thick 2px kept for emphasis.
  borderWidth: {
    none: "0",
    thin: "1px", // input + divider stroke
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Dollarama control density (à confirmer — a comfortable ~44px md control with
  // sm/lg brackets, standard retail sizing).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Dollarama typography = the clean retail sans (Open Sans / Arial, names only,
  // à confirmer). Base type 16px.
  typography: {
    control: { family: "'Open Sans', Arial, Helvetica, sans-serif", size: "1rem", weight: "600", lineHeight: "1.125", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Open Sans', Arial, Helvetica, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Open Sans', Arial, Helvetica, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Dollarama links: brand green, underline on hover (à confirmer).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // controls disabled at ≈ 40% (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // DOLLARAMA FOCUS = a 2px GREEN OUTLINE in the brand green #006C46 (focus.strategy
  // "outline", 2px). The brand green drives the focus indicator on this retail UI.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: dollaramaColor.green[500], // #006C46 — brand green focus indicator
    inset: "0"
  },
  // DOLLARAMA form fields are BOXED (outline): a white fill with a thin grey stroke
  // (1px solid #C4C4C4). `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`. The native <select> chevron
  // is redrawn in the near-black ink with a 36px right gutter.
  field: {
    style: "outline",
    fillBg: dollaramaColor.white, // #ffffff
    underlineColor: dollaramaColor.grey[200], // #C4C4C4 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%232F2F2F' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Dollarama cards: white surface, mildly rounded (8px), a soft grey border and a
  // faint pale-green hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: dollaramaColor.green[100] // #E8F5E9 pale-green hover
  },
  // Dollarama secondary button = signature YELLOW chip (action.secondary #FFE71E)
  // with BLACK ink, slightly darker yellow on hover.
  buttonSecondary: {
    background: dollaramaColor.yellow[500], // #FFE71E signage yellow
    border: dollaramaColor.yellow[600], // #f0d800 stroke
    hoverBackground: dollaramaColor.yellow[600] // #f0d800 hover
  },
  // Dollarama tabs / sub-nav: active tab = green bold label with a green bottom
  // indicator, transparent fill.
  tabs: {
    activeText: dollaramaColor.green[500], // #006C46 active label (brand green)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // green underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Dollarama pagination: borderless link text; active page = filled green pill
  // with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: dollaramaColor.green[500], // #006C46 link text (brand green)
    activeBackground: dollaramaColor.green[500], // #006C46 filled active page (brand green)
    activeText: dollaramaColor.white, // white on green
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Dollarama breadcrumb: green links, grey trail, near-black current page, grey
  // separators.
  breadcrumb: {
    linkText: dollaramaColor.green[500], // #006C46
    text: dollaramaColor.ink.secondary, // #555555 trail text
    currentText: dollaramaColor.ink.default, // #2F2F2F current page (ink)
    separator: dollaramaColor.ink.secondary, // #555555
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // Dollarama notice / alert: a tinted box with a coloured left filet matching the
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
  // Dollarama accordion / disclosure: a semibold near-black summary trigger,
  // mildly rounded, grey-separated.
  accordion: {
    text: dollaramaColor.ink.default, // #2F2F2F summary label (ink)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600", // summary triggers are semibold
    lineHeight: "1.5rem" // 24px
  },
  // Dollarama tag: a small PILL chip with a faint pale-green fill and near-black
  // ink.
  tag: {
    radius: "999px", // pill
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: dollaramaColor.green[100], // #E8F5E9 pale-green fill
    neutralText: dollaramaColor.ink.default // #2F2F2F ink
  },
  // Dollarama badge: a small filled badge — brand green fill / white text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: dollaramaColor.green[500], // #006C46 brand green
    infoText: dollaramaColor.white // white on green
  },
  // Dollarama checkbox/radio label: regular near-black type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: dollaramaColor.ink.default // #2F2F2F ink
  },
  // Dollarama search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Dollarama toggle / switch label: regular near-black type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: dollaramaColor.ink.default // #2F2F2F ink
  }
} as const;

// --- semantic (DOLLARAMA-specific role mapping) -----------------------------
const semantic = {
  surface: {
    default: dollaramaColor.white, // #ffffff white
    subtle: dollaramaColor.green[100], // #E8F5E9 pale-green page tint
    raised: dollaramaColor.white, // #ffffff white
    inverse: dollaramaColor.green[500], // #006C46 brand-green reversed surface
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop
  },
  text: {
    primary: dollaramaColor.ink.default, // #2F2F2F measured primary ink
    secondary: dollaramaColor.ink.secondary, // #555555 secondary text (à confirmer)
    muted: dollaramaColor.ink.muted, // #C4C4C4 muted text
    inverse: dollaramaColor.white, // white on dark/green surfaces
    link: dollaramaColor.green[500] // #006C46 link (brand green)
  },
  border: {
    subtle: dollaramaColor.grey[200], // #C4C4C4 divider / input stroke
    strong: dollaramaColor.ink.secondary, // #555555 stronger border (à confirmer)
    interactive: dollaramaColor.green[500] // #006C46 brand green (interactive accent)
  },
  action: {
    primary: dollaramaColor.green[500], // #006C46 THE Dollarama green CTA
    primaryHover: dollaramaColor.green[600], // #004d33 green hover/active (à confirmer)
    primaryText: dollaramaColor.white, // white text on green
    secondary: dollaramaColor.yellow[500], // #FFE71E signage yellow chip
    secondaryHover: dollaramaColor.yellow[600], // #f0d800 yellow hover (à confirmer)
    secondaryText: dollaramaColor.ink.default, // #2F2F2F black text on yellow
    danger: dollaramaColor.system.error // #d32f2f danger (à confirmer)
  },
  feedback: {
    success: dollaramaColor.system.success, // #006C46 brand green
    warning: dollaramaColor.system.warning, // #FFD700 gold (measured accent)
    error: dollaramaColor.system.error, // #d32f2f (à confirmer)
    info: dollaramaColor.system.info // #2f80ed (à confirmer)
  },
  status: {
    pending: dollaramaColor.system.warning, // #FFD700
    processing: dollaramaColor.system.info, // #2f80ed
    completed: dollaramaColor.system.success, // #006C46
    failed: dollaramaColor.system.error // #d32f2f
  },
  // Categorical data-vis palette. Dollarama does not publish a categorical token
  // list; the eight categories below are ASSEMBLED from the measured brand hexes
  // (green lead, yellow, gold, ink, greens). See MAPPING.md "à confirmer".
  data: {
    category1: dollaramaColor.green[500], // #006C46 brand green
    category2: dollaramaColor.yellow[500], // #FFE71E signage yellow
    category3: dollaramaColor.gold[500], // #FFD700 gold accent
    category4: dollaramaColor.ink.default, // #2F2F2F near-black ink
    category5: dollaramaColor.green[600], // #004d33 deep green
    category6: dollaramaColor.ink.secondary, // #555555 secondary ink
    category7: dollaramaColor.grey[200], // #C4C4C4 light grey
    category8: dollaramaColor.system.info // #2f80ed info blue
  }
} as const;

/**
 * The DOLLARAMA theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Dollarama-specific (green-and-yellow discount-
 * retail) values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Dollarama's green CTA, yellow
 * secondary chip, near-black ink, boxed fields and green focus reach the
 * components (buttons, tabs, pagination, chat bubbles…), not just the elements
 * that read semantic vars directly.
 */
export const dollaramaTheme: TenantTheme = {
  id: "dollarama",
  label: "Dollarama",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default dollaramaTheme;
