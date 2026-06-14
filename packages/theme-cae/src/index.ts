import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * CAE (cae.com — the Montréal-HQ flight-simulation, modelling & training company)
 * theme for the Sentropic token structure.
 *
 * Every value below is MEASURED from CAE's public stylesheet
 * (`cae.com/assets/css/main.css`): the frequency-ranked brand hex palette, the
 * interactive-blue action colours, the Tailwind-derived grey ramp and ring/focus
 * blue, the field rules and the `@font-face` family names. We reference font
 * *names* only ("Red Hat Display" — CAE's display + body face, with a
 * "Roboto Condensed" condensed-label face seen on some UI labels), never font
 * binaries. Sources and the full mapping are in MAPPING.md.
 *
 * CAE's identity is a DEEP-NAVY-ON-WHITE engineering system: a signature
 * DEEP NAVY (#06103D — the single most-used brand hex) anchors headings, strong
 * ink and the reversed/inverse brand surface; an INTERACTIVE BLUE (#2969F2)
 * drives every primary CTA, link and interactive accent; surfaces are WHITE on a
 * faint grey (#f8f8f8); corners are mildly rounded (6/8/12px), form fields are
 * BOXED outlines (white fill, thin grey #d1d5db stroke, 8px radius) and focus is
 * a 2px BLUE RING in the brand interactive blue (#2969F2). Where Sentropic needs
 * a role CAE does not publish, the closest measured hex (or an AA-safe default)
 * is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * CAE colour reference (measured hex, cae.com main.css):
 *   Brand deep navy (ink / inverse)     #06103D   most-used brand hex — THE CAE navy
 *   Interactive blue (action / link)    #2969F2   primary CTA / link / focus ring
 *   Interactive blue variant (lighter)  #197CF3   lighter interactive accent
 *   Interactive blue hover              #1f57d6   darkened CTA hover (à confirmer)
 *   Text primary (near-black ink)       #111827   body heading ink (tailwind slate-900)
 *   Text secondary                      #6b7280   secondary text (tailwind grey-500)
 *   Text muted                          #9ca3af   muted text (tailwind grey-400)
 *   Grey 700                            #374151   strong neutral ink
 *   Grey 600                            #4b5563   neutral ink
 *   Grey 500 / border strong            #6b7280   stronger control border
 *   Grey 400                            #9ca3af   muted / disabled
 *   Grey 300 / field stroke             #d1d5db   field outline (1px)
 *   Grey 200 / divider                  #e5e7eb   subtle border / divider
 *   Surface subtle                      #f8f8f8   faint page grey
 *   White (surface default/raised)      #ffffff   surface default / CTA text
 *   Secondary fill                      #f3f4f6   secondary button surface
 *   Danger red                          #dc2626   error / danger (à confirmer)
 *   Success green                       #16a34a   feedback success (AA-safe default)
 *   Warning amber                       #d97706   feedback warning (AA-safe default)
 *   Info blue                           #2969F2   feedback info (= interactive, à confirmer)
 */

// --- CAE raw colour palette (measured hex, cae.com main.css) ----------------
const caeColor = {
  // Deep navy ink — CAE's anchor brand colour. Headings, strong ink and the
  // reversed/inverse brand surface.
  navy: {
    500: "#06103D" // most-used brand hex — THE CAE deep navy
  },
  // Interactive blue family (primary action, links, focus ring).
  blue: {
    500: "#2969F2", // primary action / link / focus ring — THE CAE interactive blue
    400: "#197CF3", // lighter interactive variant
    600: "#1f57d6", // darkened CTA hover (à confirmer)
    ring: "#2563eb" // tailwind ring blue (measured ring utility — focus encodes brand #2969F2)
  },
  // Neutral ink / grey ramp (Tailwind scale measured on the sheet).
  ink: {
    primary: "#111827", // body/heading ink (tailwind slate-900)
    secondary: "#6b7280", // secondary text (tailwind grey-500)
    muted: "#9ca3af" // muted text (tailwind grey-400)
  },
  grey: {
    700: "#374151", // strong neutral ink
    600: "#4b5563", // neutral ink
    500: "#6b7280", // stronger control border / secondary text
    400: "#9ca3af", // muted / disabled
    300: "#d1d5db", // field outline stroke (1px)
    200: "#e5e7eb", // subtle border / divider
    100: "#f3f4f6" // secondary button surface
  },
  surface: {
    subtle: "#f8f8f8" // faint page grey
  },
  white: "#ffffff", // surface default / raised / CTA text
  // System / status colours (no distinct published CAE hues — AA-safe defaults).
  system: {
    danger: "#dc2626", // error / danger (à confirmer)
    success: "#16a34a", // success green (AA-safe default)
    warning: "#d97706", // warning amber (AA-safe default)
    info: "#2969F2" // info (= interactive blue, à confirmer)
  }
} as const;

// --- foundation (CAE-specific values) ---------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). CAE's PRIMARY
    // ACTION is the interactive blue; the lightest step is a faint blue tint.
    blue: {
      10: "#eaf1fe", // faint interactive-blue tint (derived for soft fills — à confirmer)
      60: caeColor.blue[500], // #2969F2 THE CAE interactive blue (primary action)
      80: caeColor.blue[600] // #1f57d6 darkened hover/active ground
    },
    // Sentropic "cyan" accent slot. CAE's cool accent is the lighter interactive
    // blue / deep navy family; mapped here so a distinct cool accent survives
    // (à confirmer).
    cyan: {
      10: "#eaf1fe", // faint blue tint (à confirmer)
      50: caeColor.blue[400], // #197CF3 lighter interactive blue accent
      70: caeColor.navy[500] // #06103D deep navy
    },
    // Sentropic "slate" neutral family mapped onto the CAE navy ink and grey ramp.
    slate: {
      0: caeColor.white, // #ffffff white
      10: caeColor.surface.subtle, // #f8f8f8 faint page grey
      20: caeColor.grey[200], // #e5e7eb divider / subtle border
      60: caeColor.ink.secondary, // #6b7280 secondary text
      80: caeColor.ink.primary, // #111827 primary text (near-black ink)
      90: caeColor.navy[500] // #06103D deep navy (strongest brand ink)
    },
    feedback: {
      success: caeColor.system.success,
      warning: caeColor.system.warning,
      error: caeColor.system.danger,
      info: caeColor.system.info
    }
  },
  // CAE serves "Red Hat Display" across display/headings and body/UI (measured
  // from the site's `@font-face` declarations), with a "Roboto Condensed"
  // condensed face seen on some labels. We reference the family NAMES only, with a
  // system sans fallback chain. Mono is not part of CAE — the Sentropic ui-monospace
  // stack is kept.
  font: {
    sans: "'Red Hat Display', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    display: "'Red Hat Display', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
  },
  // CAE spacing: a 4/8px-based ramp aligned to the Sentropic step keys.
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
  // CAE rounds corners mildly (measured radii: sm 6px, md 8px, lg 12px). Controls
  // use 8px; pill kept for chips/tags/badges.
  radius: {
    none: "0", // square
    sm: "0.375rem", // 6px (measured small radius)
    md: "0.5rem", // 8px (measured control/field radius)
    lg: "0.75rem", // 12px (measured larger surfaces/cards)
    pill: "999px" // fully-rounded chips/tags/badges
  },
  // CAE elevation — soft light-tinted shadows (à confirmer; exact box-shadows not
  // separately tokenised, kept aligned with the base three slots).
  shadow: {
    subtle: "0 1px 3px rgb(0 0 0 / 0.10)",
    medium: "0 4px 8px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.16), 0 2px 4px rgb(0 0 0 / 0.10)"
  },
  // CAE transitions are short and standard (à confirmer; exact step ramp not
  // separately tokenised, kept aligned with the base).
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not CAE-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (CAE) --------------------------------------------
  // CAE field/divider strokes measured at 1px solid #d1d5db (field) / #e5e7eb
  // (divider); thick 2px kept for emphasis / the focus ring.
  borderWidth: {
    none: "0",
    thin: "1px", // measured field + divider stroke
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // CAE control density. md targets a comfortable ~44px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // CAE typography = "Red Hat Display" (display + body/controls). Control labels
  // are medium-weight; field text regular; labels semibold. Base type is 16px.
  typography: {
    control: { family: "'Red Hat Display', system-ui, Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.125", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Red Hat Display', system-ui, Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Red Hat Display', system-ui, Arial, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // CAE links: interactive blue, underline on hover (measured anchor
    // `text-decoration:none` at rest).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4", // CAE disables controls at ≈ 40% (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" }, // standard field transition (à confirmer)
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // CAE FOCUS = a BLUE RING. The site uses the Tailwind `ring` utility
  // (`#2563eb`); we encode a 2px ring in the brand interactive blue `#2969F2` so
  // the indicator matches the action colour.
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: caeColor.blue[500], // #2969F2 — brand interactive-blue focus ring
    inset: "0"
  },
  // CAE form fields are BOXED (outline): a white fill with a thin grey stroke
  // (measured `1px solid #d1d5db`) and an 8px radius. `style: "outline"` makes the
  // builder draw four equal borders from `surface.default` + `border.subtle`. The
  // native <select> chevron is redrawn in the deep navy ink with a 36px right
  // gutter (appearance: none).
  field: {
    style: "outline",
    fillBg: caeColor.white, // #ffffff
    underlineColor: caeColor.grey[300], // #d1d5db (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2306103D' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // CAE cards: white surface, mildly rounded (12px), a soft grey border and a
  // faint grey hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: caeColor.surface.subtle // #f8f8f8 faint grey hover
  },
  // CAE secondary button = filled grey: faint grey fill, navy text, darker grey on
  // hover (measured secondary surface #f3f4f6 / hover #e5e7eb).
  buttonSecondary: {
    background: caeColor.grey[100], // #f3f4f6 grey fill
    border: "transparent",
    hoverBackground: caeColor.grey[200] // #e5e7eb darker grey on hover
  },
  // CAE tabs / sub-nav: active tab = interactive-blue bold label with a blue bottom
  // indicator (the brand accent bar), transparent fill.
  tabs: {
    activeText: caeColor.blue[500], // #2969F2 active label (interactive blue)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px (CAE base type)
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // blue underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // CAE pagination: borderless blue link text; active page = filled interactive-blue
  // pill with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: caeColor.blue[500], // #2969F2 link text
    activeBackground: caeColor.blue[500], // #2969F2 filled active page (interactive blue)
    activeText: caeColor.white, // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // CAE breadcrumb: blue links, grey trail, navy current page, grey separators.
  breadcrumb: {
    linkText: caeColor.blue[500], // #2969F2
    text: caeColor.ink.secondary, // #6b7280 trail text
    currentText: caeColor.navy[500], // #06103D current page (navy)
    separator: caeColor.ink.secondary, // #6b7280
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // CAE notice / alert: a tinted box with a coloured left filet matching the
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
  // CAE accordion / disclosure: a semibold navy summary trigger, mildly rounded,
  // grey-separated.
  accordion: {
    text: caeColor.navy[500], // #06103D summary label (navy)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600", // CAE summary triggers are semibold
    lineHeight: "1.5rem" // 24px
  },
  // CAE tag: a small chip with a faint grey fill and navy ink. CAE corners are
  // mild — tags use the 6px small radius rather than a full pill.
  tag: {
    radius: "0.375rem", // 6px (CAE mild rounding)
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: caeColor.grey[100], // #f3f4f6 faint grey fill
    neutralText: caeColor.navy[500] // #06103D navy
  },
  // CAE badge: a small filled badge — interactive-blue fill / white text.
  badge: {
    radius: "0.375rem", // 6px
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: caeColor.blue[500], // #2969F2 interactive blue
    infoText: caeColor.white // white on blue
  },
  // CAE checkbox/radio label: regular navy type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: caeColor.navy[500] // #06103D navy
  },
  // CAE search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // CAE toggle / switch label: regular navy type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: caeColor.navy[500] // #06103D navy
  }
} as const;

// --- semantic (CAE-specific role mapping) -----------------------------------
const semantic = {
  surface: {
    default: caeColor.white, // #ffffff white
    subtle: caeColor.surface.subtle, // #f8f8f8 faint page grey
    raised: caeColor.white, // #ffffff white
    inverse: caeColor.navy[500], // #06103D deep navy reversed surface (brand dark)
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop
  },
  text: {
    primary: caeColor.ink.primary, // #111827 near-black ink (primary text + headings)
    secondary: caeColor.ink.secondary, // #6b7280 secondary text
    muted: caeColor.ink.muted, // #9ca3af muted text
    inverse: caeColor.white, // white on dark/navy surfaces
    link: caeColor.blue[500] // #2969F2 interactive-blue link
  },
  border: {
    subtle: caeColor.grey[200], // #e5e7eb divider / subtle border
    strong: caeColor.grey[500], // #6b7280 stronger control border
    interactive: caeColor.blue[500] // #2969F2 interactive blue accent
  },
  action: {
    primary: caeColor.blue[500], // #2969F2 THE CAE interactive-blue CTA
    primaryHover: caeColor.blue[600], // #1f57d6 blue hover/active (à confirmer)
    primaryText: caeColor.white, // white text on blue
    secondary: caeColor.grey[100], // #f3f4f6 grey secondary surface
    secondaryHover: caeColor.grey[200], // #e5e7eb
    secondaryText: caeColor.navy[500], // #06103D navy secondary label
    danger: caeColor.system.danger // #dc2626 danger red (à confirmer)
  },
  feedback: {
    success: caeColor.system.success, // #16a34a
    warning: caeColor.system.warning, // #d97706
    error: caeColor.system.danger, // #dc2626
    info: caeColor.system.info // #2969F2
  },
  status: {
    pending: caeColor.system.warning, // #d97706
    processing: caeColor.system.info, // #2969F2
    completed: caeColor.system.success, // #16a34a
    failed: caeColor.system.danger // #dc2626
  },
  // Categorical data-vis palette. CAE does not publish a single categorical token
  // list; the eight categories below are assembled from the measured navy / blue /
  // grey brand hexes (interactive blue lead, deep navy, lighter blue, grey ramp,
  // success green, amber) to give a legible brand-true scale.
  // See MAPPING.md, "à confirmer" — this is an assembled scale.
  data: {
    category1: caeColor.blue[500], // #2969F2 interactive blue
    category2: caeColor.navy[500], // #06103D deep navy
    category3: caeColor.blue[400], // #197CF3 lighter interactive blue
    category4: caeColor.grey[500], // #6b7280 grey-500
    category5: caeColor.grey[700], // #374151 grey-700
    category6: caeColor.system.success, // #16a34a success green
    category7: caeColor.system.warning, // #d97706 amber
    category8: caeColor.grey[400] // #9ca3af grey-400
  }
} as const;

/**
 * The CAE theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry CAE-specific (deep-navy / interactive-blue
 * engineering) values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so CAE's blue CTA, navy ink, mild
 * rounding, boxed fields and blue focus ring reach the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const caeTheme: TenantTheme = {
  id: "cae",
  label: "CAE",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default caeTheme;
