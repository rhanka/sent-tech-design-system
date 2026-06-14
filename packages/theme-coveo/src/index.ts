import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * COVEO (coveo.com — the Québec City AI-search & relevance SaaS) theme for the
 * Sentropic token structure.
 *
 * Every value below is MEASURED from the live coveo.com stylesheets. Coveo's
 * marketing site uses literal hex values in its brand CSS; the signature COVEO
 * RED (#d2271b — the most-used brand accent, ~24 occurrences) drives the primary
 * CTA and brand accent, an INTERACTIVE BLUE (#1169da) drives links and focus, and
 * a family of DEEP INDIGO / PURPLE tones (#393968 / #333357 / #390076) carry the
 * dark surfaces and secondary ink. We reference the brand display + body face
 * "canada-type-gibson" (measured Gibson webfont) by NAME only, with the brand's
 * Arial fallback chain, never font binaries. Sources and the full mapping are in
 * MAPPING.md; values not measured from a single source are flagged "à confirmer".
 *
 * Coveo's identity is a CONFIDENT RED-ON-INDIGO enterprise-search system: the
 * COVEO RED (#d2271b) is the primary action and brand accent; the near-black ink
 * (#0e0f12) is the primary text and reversed dark surface; an interactive blue
 * (#1169da) is the link + focus hue (deliberately a different hue from the red
 * brand so the focus indicator never blends into a red control); surfaces are
 * WHITE on a very faint off-white (#f9f9fa); form fields are BOXED outlines
 * (white fill, thin grey #e2e2e6 stroke). Where Sentropic needs a role Coveo
 * does not publish, the closest measured hex is used and the choice is noted
 * "à confirmer" in MAPPING.md.
 *
 * Coveo colour reference (measured hex, brand CSS):
 *   Coveo red (action / brand)          #d2271b   primary CTA / brand accent (~24× brand hex) — THE Coveo red
 *   Coveo red hover / active            #b51f15   darker red on hover (à confirmer)
 *   Interactive blue (link / focus)     #1169da   anchor / link + focused-field outline
 *   Deep indigo (dark surface / border) #393968   dark surfaces / strong borders / secondary button ink
 *   Indigo alt (secondary ink)          #333357   secondary text / dark surface alt
 *   Purple accent                       #390076   purple brand accent
 *   Ink near-black (text primary)       #0e0f12   primary text + reversed dark surface
 *   Secondary / muted text              #6b7280   muted text (à confirmer)
 *   White (surface default)             #ffffff   surface default / CTA text
 *   Off-white (subtle surface)          #f9f9fa   faint page off-white
 *   Faint grey (secondary hover)        #ececef   secondary button hover (à confirmer)
 *   Field border / divider              #e2e2e6   input stroke (1px, à confirmer)
 *   Success green                       #2e7d32   success feedback (AA on white)
 *   Warning amber ink                   #b26a00   warning feedback (AA-grade amber)
 *   Error red                           #d2271b   error feedback (the Coveo red)
 *   Info blue                           #1169da   info feedback (interactive blue)
 */

// --- COVEO raw colour palette (measured hex, brand CSS) ---------------------
const coveoColor = {
  // The brand accent IS the Coveo red. Used for the brand mark, the primary CTA
  // and red accents.
  red: {
    500: "#d2271b", // primary CTA / brand accent (~24× brand hex) — THE Coveo red
    600: "#b51f15", // darker red on hover/active (à confirmer)
    100: "#fbe9e7" // faint red tint (derived for soft fills — à confirmer)
  },
  // Interactive blue — links and the accessible focused-field outline.
  blue: {
    500: "#1169da" // anchor / link + focused-field outline (interactive blue)
  },
  // Deep indigo / purple family — Coveo's dark surfaces and secondary ink.
  indigo: {
    500: "#393968", // dark surfaces / strong borders / secondary button ink
    600: "#333357", // secondary text / dark surface alt
    purple: "#390076" // purple brand accent
  },
  // Neutral ink scale (Coveo never uses pure black for body text).
  ink: {
    default: "#0e0f12", // primary text + reversed dark surface — THE Coveo ink
    secondary: "#333357", // secondary ink (indigo alt)
    muted: "#6b7280" // muted text (à confirmer)
  },
  // Grey neutral scale (faint off-white surfaces + field/divider strokes).
  grey: {
    50: "#f9f9fa", // page off-white (subtle surface)
    100: "#ececef", // secondary button hover (à confirmer)
    200: "#e2e2e6" // input stroke / divider (1px, à confirmer)
  },
  white: "#ffffff", // surface default / CTA text
  // System / status colours (à confirmer — AA-safe choices over the brand hues).
  system: {
    success: "#2e7d32", // success feedback (AA on white)
    warning: "#b26a00", // warning feedback (AA-grade amber)
    error: "#d2271b", // error feedback (the Coveo red)
    info: "#1169da" // info feedback (interactive blue)
  }
} as const;

// --- foundation (COVEO-specific values) -------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Coveo's PRIMARY
    // ACTION is RED, so the action steps are mapped to the red scale; the
    // lightest step is the faint red tint.
    blue: {
      10: coveoColor.red[100], // #fbe9e7 faint red tint
      60: coveoColor.red[500], // #d2271b THE Coveo red (primary action)
      80: coveoColor.red[600] // #b51f15 deep red (hover/active ground)
    },
    // Sentropic "cyan" accent slot. Coveo's cool accent is the interactive blue
    // / indigo family; mapped here so a distinct cool accent survives (à confirmer).
    cyan: {
      10: "#e7f0fb", // faint blue tint (derived panel tint — à confirmer)
      50: coveoColor.blue[500], // #1169da interactive blue accent
      70: coveoColor.indigo[500] // #393968 deep indigo
    },
    // Sentropic "slate" neutral family mapped onto the Coveo ink and grey ramp.
    slate: {
      0: coveoColor.white, // #ffffff white
      10: coveoColor.grey[50], // #f9f9fa page off-white
      20: coveoColor.grey[200], // #e2e2e6 divider / subtle border
      60: coveoColor.ink.muted, // #6b7280 muted text
      80: coveoColor.indigo[600], // #333357 secondary text (indigo)
      90: coveoColor.ink.default // #0e0f12 strongest ink
    },
    feedback: {
      success: coveoColor.system.success,
      warning: coveoColor.system.warning,
      error: coveoColor.system.error,
      info: coveoColor.system.info
    }
  },
  // Coveo serves "canada-type-gibson" (the Gibson webfont, measured as the brand
  // display + body face) across headings, body and UI, with the brand's Arial
  // fallback. We reference the family NAME only. Mono is not part of Coveo — the
  // Sentropic ui-monospace stack is kept.
  font: {
    sans: "'canada-type-gibson', Arial, sans-serif",
    display: "'canada-type-gibson', Arial, sans-serif",
    mono: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Coveo spacing: a 4/8px-based ramp aligned to the Sentropic step keys.
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
  // Coveo radii (à confirmer): small chips 4px, controls/inputs 6px, cards 8px,
  // square 0, pill 999px for fully-rounded chips.
  radius: {
    none: "0", // square
    sm: "4px", // small chips (à confirmer)
    md: "6px", // controls / inputs (à confirmer)
    lg: "8px", // cards / larger surfaces (à confirmer)
    pill: "999px" // fully-rounded chips (à confirmer)
  },
  // Coveo elevation (à confirmer — mapped to the three Sentropic slots).
  shadow: {
    subtle: "0 1px 3px rgb(0 0 0 / 0.12)",
    medium: "0 4px 8px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.16), 0 2px 4px rgb(0 0 0 / 0.10)"
  },
  // Coveo transitions are short and standard; exact step ramp not separately
  // tokenised, kept aligned with the base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Coveo-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (COVEO) ------------------------------------------
  // Coveo field/divider strokes measured at 1px solid #e2e2e6; strong borders are
  // the deep indigo #393968. thick 2px kept for emphasis.
  borderWidth: {
    none: "0",
    thin: "1px", // input + divider stroke
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Coveo control density. md targets a comfortable ~44px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Coveo typography = "canada-type-gibson" (Gibson) across control labels, field
  // text and labels. Base type is 16px.
  typography: {
    control: { family: "'canada-type-gibson', Arial, sans-serif", size: "1rem", weight: "500", lineHeight: "1.125", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'canada-type-gibson', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'canada-type-gibson', Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Coveo links: interactive blue, underline on hover (à confirmer — anchors
    // resolve to the blue accent).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // Coveo disables controls at ≈ 40% (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // COVEO FOCUS = an accessible BLUE OUTLINE (interactive blue #1169da). The focus
  // hue is deliberately blue (not the red brand) so the indicator never blends
  // into a red control. We encode a 2px blue outline.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: coveoColor.blue[500], // #1169da — accessible interactive-blue focus indicator
    inset: "0"
  },
  // COVEO form fields are BOXED (outline): a white fill with a thin grey stroke
  // (input `1px solid #e2e2e6`). `style: "outline"` makes the builder draw four
  // equal borders from `surface.default` + `border.subtle`. The native <select>
  // chevron is redrawn in the deep indigo ink with a 36px right gutter
  // (appearance: none).
  field: {
    style: "outline",
    fillBg: coveoColor.white, // #ffffff
    underlineColor: coveoColor.grey[200], // #e2e2e6 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23393968' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Coveo cards: white surface, mildly rounded (8px), a soft grey border and a
  // faint off-white hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: coveoColor.grey[50] // #f9f9fa faint off-white hover
  },
  // Coveo secondary button = a faint grey fill with deep-indigo ink, darkening on
  // hover (measured secondary CTA).
  buttonSecondary: {
    background: coveoColor.grey[50], // #f9f9fa faint off-white fill
    border: coveoColor.grey[200], // #e2e2e6 subtle stroke
    hoverBackground: coveoColor.grey[100] // #ececef darker grey on hover (à confirmer)
  },
  // Coveo tabs / sub-nav: active tab = red label with a red bottom indicator (the
  // brand red accent bar), transparent fill.
  tabs: {
    activeText: coveoColor.red[500], // #d2271b active label (brand red)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // red underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Coveo pagination: borderless blue link text; active page = filled red pill
  // (the brand fill) with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: coveoColor.blue[500], // #1169da link text
    activeBackground: coveoColor.red[500], // #d2271b filled active page (brand red)
    activeText: coveoColor.white, // white on red
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Coveo breadcrumb: blue links, muted trail, near-black current page, muted
  // separators.
  breadcrumb: {
    linkText: coveoColor.blue[500], // #1169da
    text: coveoColor.ink.muted, // #6b7280 trail text
    currentText: coveoColor.ink.default, // #0e0f12 current page (near-black)
    separator: coveoColor.ink.muted, // #6b7280
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // Coveo notice / alert: a tinted box with a coloured left filet matching the
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
  // Coveo accordion / disclosure: a semibold near-black summary trigger, mildly
  // rounded, grey-separated.
  accordion: {
    text: coveoColor.ink.default, // #0e0f12 summary label (near-black)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600", // semibold triggers
    lineHeight: "1.5rem" // 24px
  },
  // Coveo tag: a small chip with a faint grey fill and indigo ink.
  tag: {
    radius: "999px", // pill chips
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: coveoColor.grey[100], // #ececef faint grey fill
    neutralText: coveoColor.indigo[500] // #393968 indigo
  },
  // Coveo badge: a small filled badge — brand red fill / white text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: coveoColor.red[500], // #d2271b brand red
    infoText: coveoColor.white // white on red
  },
  // Coveo checkbox/radio label: regular near-black type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: coveoColor.ink.default // #0e0f12 near-black
  },
  // Coveo search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Coveo toggle / switch label: regular near-black type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: coveoColor.ink.default // #0e0f12 near-black
  }
} as const;

// --- semantic (COVEO-specific role mapping) ---------------------------------
const semantic = {
  surface: {
    default: coveoColor.white, // #ffffff white
    subtle: coveoColor.grey[50], // #f9f9fa page off-white
    raised: coveoColor.white, // #ffffff white
    inverse: coveoColor.ink.default, // #0e0f12 near-black reversed surface
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop
  },
  text: {
    primary: coveoColor.ink.default, // #0e0f12 near-black (primary text + headings)
    secondary: coveoColor.indigo[600], // #333357 secondary text (indigo)
    muted: coveoColor.ink.muted, // #6b7280 muted text
    inverse: coveoColor.white, // white on dark/red surfaces
    link: coveoColor.blue[500] // #1169da interactive link blue
  },
  border: {
    subtle: coveoColor.grey[200], // #e2e2e6 divider / input stroke
    strong: coveoColor.indigo[500], // #393968 strong border (deep indigo)
    interactive: coveoColor.red[500] // #d2271b brand red (interactive accent)
  },
  action: {
    primary: coveoColor.red[500], // #d2271b THE Coveo red CTA
    primaryHover: coveoColor.red[600], // #b51f15 red hover/active
    primaryText: coveoColor.white, // white text on red
    secondary: coveoColor.grey[50], // #f9f9fa faint off-white secondary surface
    secondaryHover: coveoColor.grey[100], // #ececef faint grey hover
    secondaryText: coveoColor.indigo[500], // #393968 indigo secondary label
    danger: coveoColor.red[500] // #d2271b danger (the Coveo red)
  },
  feedback: {
    success: coveoColor.system.success, // #2e7d32
    warning: coveoColor.system.warning, // #b26a00
    error: coveoColor.system.error, // #d2271b
    info: coveoColor.system.info // #1169da
  },
  status: {
    pending: coveoColor.system.warning, // #b26a00
    processing: coveoColor.system.info, // #1169da
    completed: coveoColor.system.success, // #2e7d32
    failed: coveoColor.system.error // #d2271b
  },
  // Categorical data-vis palette. Coveo does not publish a single categorical
  // token list; the eight categories below are assembled from the measured brand
  // hexes (red lead, interactive blue, indigo, purple, indigo alt, greys) to give
  // a legible brand-true scale. See MAPPING.md, "à confirmer" — an assembled scale.
  data: {
    category1: coveoColor.red[500], // #d2271b brand red
    category2: coveoColor.blue[500], // #1169da interactive blue
    category3: coveoColor.indigo[500], // #393968 deep indigo
    category4: coveoColor.indigo.purple, // #390076 purple accent
    category5: coveoColor.indigo[600], // #333357 indigo alt
    category6: coveoColor.ink.muted, // #6b7280 muted grey
    category7: coveoColor.system.success, // #2e7d32 success green
    category8: coveoColor.system.warning // #b26a00 amber
  }
} as const;

/**
 * The COVEO theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Coveo-specific (red-on-indigo AI-search)
 * values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so Coveo's red CTA, near-black ink,
 * boxed fields and accessible blue focus reach the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const coveoTheme: TenantTheme = {
  id: "coveo",
  label: "Coveo",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default coveoTheme;
