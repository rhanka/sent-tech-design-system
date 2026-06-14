import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * NUVEI (nuvei.com — the Montréal-headquartered fintech / payments company)
 * theme for the Sentropic token structure.
 *
 * Every value below is MEASURED from nuvei.com's public CSS (computed styles on
 * the live marketing site: buttons, links, headings, surfaces, inputs). We
 * reference font *names* only ("Inter Tight", measured as the site's display +
 * body sans), never font binaries. Sources and the full mapping table are in
 * MAPPING.md. Anything derived rather than directly measured is flagged
 * "à confirmer" inline and in MAPPING.md.
 *
 * Nuvei's identity is a MODERN PAYMENTS / FINTECH system: a DEEP INDIGO
 * (#160850, the dominant brand colour — measured 159× across the site) drives
 * every primary action, the brand ink and the inverse surface; a bright CYAN
 * (#0C98D4) is the interactive / link accent; a hot MAGENTA (#E40046) is the
 * brand's danger / alert hue. Surfaces are white on a faint CREAM page
 * (#FAF9F8); corners are modern-fintech rounded (4 / 8 / 12px); form fields are
 * BOXED outlines (white fill, 1px #CFC9C2 stroke, redrawn select chevron) and
 * focus is a 2px CYAN ring (#0C98D4) — deliberately a different hue from the
 * indigo brand so the focus indicator never blends into an indigo control.
 * Where Sentropic needs a role Nuvei does not publish, the closest measured
 * value is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Nuvei colour reference (measured from nuvei.com, light theme):
 *   Deep indigo (brand / action / ink)  #160850   dominant brand colour (159× measured)
 *   Indigo hover (deeper)               #2a1a6e   measured deeper hover step
 *   Cyan (link / interactive accent)    #0C98D4   measured link / interactive
 *   Magenta (alert / danger)            #E40046   brand magenta → action.danger
 *   Text secondary                      #6B778C   measured secondary text
 *   Text muted                          #8c95a6   muted text (à confirmer)
 *   White (surface default / raised)    #ffffff   surface default
 *   Cream (subtle surface)              #FAF9F8   measured faint cream page
 *   Secondary hover                     #efe9e6   secondary button hover (à confirmer)
 *   Border subtle (field stroke)        #CFC9C2   measured 1px field / select stroke
 *   Border strong                       #6B778C   measured stronger border
 *   Feedback success                    #2e7d32   AA-safe green (à confirmer)
 *   Feedback warning                    #b26a00   AA-safe amber (à confirmer)
 *   Feedback error                      #E40046   brand magenta as error
 *   Feedback info                       #0C98D4   cyan as info (à confirmer)
 */

// --- NUVEI raw colour palette (measured from nuvei.com) ----------------------
const nuveiColor = {
  // The brand IS the deep indigo. Used for the logo, every primary CTA, brand
  // ink and the inverse surface (measured as the single dominant hue).
  indigo: {
    600: "#160850", // deep indigo — THE Nuvei brand colour (action / ink / inverse)
    700: "#2a1a6e" // deeper indigo — measured primary hover step
  },
  // Cyan — the interactive / link accent (distinct from the indigo brand).
  cyan: "#0C98D4", // link / interactive / focus accent
  // Magenta — the brand's hot alert / danger hue.
  magenta: "#E40046", // action.danger / error
  white: "#ffffff", // surface default / raised
  cream: "#FAF9F8", // faint cream subtle surface (page background)
  // Soft secondary cream-grey hover fill (à confirmer — derived).
  creamHover: "#efe9e6", // secondary button hover
  // Neutral / ink scale.
  ink: {
    secondary: "#6B778C", // secondary text + stronger border
    muted: "#8c95a6" // muted text (à confirmer)
  },
  // Borders.
  borderSubtle: "#CFC9C2", // measured 1px field / select stroke + subtle divider
  // System / status colours (AA-safe where noted).
  system: {
    success: "#2e7d32", // AA-safe green (à confirmer)
    warning: "#b26a00", // AA-safe amber (à confirmer)
    error: "#E40046", // brand magenta as error
    info: "#0C98D4" // cyan as info (à confirmer)
  }
} as const;

// --- foundation (NUVEI-specific values) -------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary). Nuvei's PRIMARY ACTION is
    // the deep indigo, so the action steps map to the indigo scale; the lightest
    // step is the faint cream.
    blue: {
      10: nuveiColor.cream, // #FAF9F8 faint cream tint
      60: nuveiColor.indigo[600], // #160850 THE Nuvei deep indigo (primary action)
      80: nuveiColor.indigo[700] // #2a1a6e deeper indigo (hover ground)
    },
    // Sentropic "cyan" accent slot — Nuvei's measured cyan link / interactive
    // accent maps directly here.
    cyan: {
      10: nuveiColor.cream, // #FAF9F8 light tint
      50: nuveiColor.cyan, // #0C98D4 brand cyan accent
      70: nuveiColor.indigo[600] // #160850 deep indigo as the darkest cool step
    },
    // Sentropic "slate" neutral family mapped onto the Nuvei neutral / ink ramp.
    slate: {
      0: nuveiColor.white, // #ffffff white
      10: nuveiColor.cream, // #FAF9F8 cream page
      20: nuveiColor.borderSubtle, // #CFC9C2 subtle border / divider
      60: nuveiColor.ink.secondary, // #6B778C secondary text
      80: nuveiColor.indigo[600], // #160850 primary text (deep indigo ink)
      90: nuveiColor.indigo[600] // #160850 darkest ink (Nuvei uses indigo, not black)
    },
    feedback: {
      success: nuveiColor.system.success,
      warning: nuveiColor.system.warning,
      error: nuveiColor.system.error,
      info: nuveiColor.system.info
    }
  },
  // Nuvei serves "Inter Tight" across the whole site (measured as both display
  // and body sans). We reference the NAME only, with a system fallback chain.
  // Monospace is not part of Nuvei — the Sentropic mono stack is kept.
  font: {
    sans: "'Inter Tight', system-ui, sans-serif",
    display: "'Inter Tight', system-ui, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // 4px-based spacing ramp aligned to the Sentropic step keys (à confirmer — the
  // exact source ramp is not separately tokenised publicly).
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
  // Nuvei rounds modern-fintech: 0 / 4 / 8 / 12 / 999(pill). Controls use 4–8px;
  // cards step up to 12px (à confirmer — derived from the modern-fintech look).
  radius: {
    none: "0",
    sm: "4px", // controls (button / input / select)
    md: "8px", // larger surfaces
    lg: "12px", // cards / panels
    pill: "999px" // pills / tags
  },
  // Soft modern elevation, mapped to the three Sentropic slots (à confirmer —
  // exact shadow tokens not published).
  shadow: {
    subtle: "0px 1px 2px rgb(22 8 80 / 0.08)",
    medium: "0px 4px 12px rgb(22 8 80 / 0.10)",
    floating: "0px 12px 32px rgb(22 8 80 / 0.14)"
  },
  // Standard short transitions (à confirmer — exact durations not tokenised).
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (NUVEI) ------------------------------------------
  // Nuvei field / select borders measured at 1px solid #CFC9C2.
  borderWidth: {
    none: "0",
    thin: "1px", // field stroke + body dividers
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Nuvei control density: comfortable modern-fintech controls. md targets a
  // ~44px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Nuvei typography = "Inter Tight". Control labels are semibold (600), body /
  // field text regular (400), labels medium (500). Base type 16px.
  typography: {
    control: { family: "'Inter Tight', system-ui, sans-serif", size: "0.9375rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Inter Tight', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Inter Tight', system-ui, sans-serif", size: "0.9375rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Nuvei links are the cyan accent; underline on hover (à confirmer — rest
    // decoration measured as none on the marketing site).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.4",
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "200ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // NUVEI FOCUS = a 2px CYAN RING (#0C98D4). The focus hue is deliberately cyan
  // (not the indigo brand) so the indicator never blends into an indigo control.
  focus: {
    strategy: "ring",
    width: "2px",
    offset: "2px",
    color: nuveiColor.cyan, // #0C98D4 — cyan focus ring
    inset: "0"
  },
  // NUVEI form fields are BOXED (outline): white fill, a thin grey stroke
  // (measured 1px solid #CFC9C2) and a 4px radius. The native <select> chevron
  // is redrawn in the deep-indigo ink with a right gutter.
  field: {
    style: "outline",
    fillBg: nuveiColor.white, // #ffffff
    underlineColor: nuveiColor.borderSubtle, // #CFC9C2 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23160850' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Nuvei cards: white surface, modern rounding (12px), a soft border and a faint
  // cream-tinted hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: nuveiColor.cream // #FAF9F8 faint cream hover
  },
  // Nuvei secondary button = soft cream fill, indigo text (à confirmer — derived
  // from the marketing CTA pairing).
  buttonSecondary: {
    background: nuveiColor.cream, // #FAF9F8
    border: nuveiColor.borderSubtle, // #CFC9C2 soft stroke
    hoverBackground: nuveiColor.creamHover // #efe9e6 faint cream hover
  },
  // Nuvei tabs / sub-nav: active tab = indigo bold label with an indigo bottom
  // indicator, transparent fill.
  tabs: {
    activeText: nuveiColor.indigo[600], // #160850 active label (deep indigo)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // indigo underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Nuvei pagination: borderless cyan link text; active page = filled indigo
  // square with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: nuveiColor.cyan, // #0C98D4 link text
    activeBackground: nuveiColor.indigo[600], // #160850 filled active page (brand indigo)
    activeText: nuveiColor.white, // white on indigo
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Nuvei breadcrumb: cyan links, grey trail, indigo current page, grey separators.
  breadcrumb: {
    linkText: nuveiColor.cyan, // #0C98D4
    text: nuveiColor.ink.secondary, // #6B778C trail text
    currentText: nuveiColor.indigo[600], // #160850 current page
    separator: nuveiColor.ink.secondary, // #6B778C
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // Nuvei notice / alert: a tinted box with a coloured left filet matching the
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
  // Nuvei accordion / disclosure: a semibold indigo summary trigger, mildly
  // rounded, grey-separated.
  accordion: {
    text: nuveiColor.indigo[600], // #160850 summary label
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600", // Nuvei summary triggers are semibold
    lineHeight: "1.5rem" // 24px
  },
  // Nuvei tag: a small PILL chip with a faint cream fill and indigo ink.
  tag: {
    radius: "999px", // Nuvei tags / pills round fully
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: nuveiColor.cream, // #FAF9F8 cream fill
    neutralText: nuveiColor.indigo[600] // #160850
  },
  // Nuvei badge: a small filled badge — brand indigo fill / white text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: nuveiColor.indigo[600], // #160850 brand indigo
    infoText: nuveiColor.white // white on indigo
  },
  // Nuvei checkbox / radio label: regular indigo type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: nuveiColor.indigo[600] // #160850
  },
  // Nuvei search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Nuvei toggle / switch label: regular indigo type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: nuveiColor.indigo[600] // #160850
  }
} as const;

// --- semantic (NUVEI-specific role mapping) ---------------------------------
const semantic = {
  surface: {
    default: nuveiColor.white, // #ffffff white
    subtle: nuveiColor.cream, // #FAF9F8 cream page
    raised: nuveiColor.white, // #ffffff white
    inverse: nuveiColor.indigo[600], // #160850 deep indigo inverse surface
    overlay: "rgb(22 8 80 / 0.6)" // indigo-tinted modal backdrop
  },
  text: {
    primary: nuveiColor.indigo[600], // #160850 deep indigo ink
    secondary: nuveiColor.ink.secondary, // #6B778C
    muted: nuveiColor.ink.muted, // #8c95a6 (à confirmer)
    inverse: nuveiColor.white, // white on dark / indigo surfaces
    link: nuveiColor.cyan // #0C98D4 cyan link
  },
  border: {
    subtle: nuveiColor.borderSubtle, // #CFC9C2 divider / field stroke
    strong: nuveiColor.ink.secondary, // #6B778C stronger border
    interactive: nuveiColor.indigo[600] // #160850 brand indigo (interactive accent)
  },
  action: {
    primary: nuveiColor.indigo[600], // #160850 THE Nuvei deep-indigo CTA
    primaryHover: nuveiColor.indigo[700], // #2a1a6e deeper indigo hover
    primaryText: nuveiColor.white, // white text on indigo
    secondary: nuveiColor.cream, // #FAF9F8 cream secondary surface
    secondaryHover: nuveiColor.creamHover, // #efe9e6 (à confirmer)
    secondaryText: nuveiColor.indigo[600], // #160850 indigo secondary label
    danger: nuveiColor.magenta // #E40046 brand magenta
  },
  feedback: {
    success: nuveiColor.system.success, // #2e7d32
    warning: nuveiColor.system.warning, // #b26a00
    error: nuveiColor.system.error, // #E40046
    info: nuveiColor.system.info // #0C98D4
  },
  status: {
    pending: nuveiColor.system.warning, // #b26a00
    processing: nuveiColor.system.info, // #0C98D4
    completed: nuveiColor.system.success, // #2e7d32
    failed: nuveiColor.system.error // #E40046
  },
  // Categorical data-vis palette assembled from the Nuvei brand hues (indigo,
  // cyan, magenta, deeper indigo) plus neutral greys. See MAPPING.md,
  // "à confirmer" — this is an assembled scale, not a published categorical list.
  data: {
    category1: nuveiColor.indigo[600], // #160850 deep indigo
    category2: nuveiColor.cyan, // #0C98D4 cyan
    category3: nuveiColor.magenta, // #E40046 magenta
    category4: nuveiColor.indigo[700], // #2a1a6e deeper indigo
    category5: nuveiColor.ink.secondary, // #6B778C secondary grey
    category6: nuveiColor.ink.muted, // #8c95a6 muted grey
    category7: "#0a6a96", // deepened cyan (à confirmer — derived for contrast)
    category8: "#a3002f" // deepened magenta (à confirmer — derived for contrast)
  }
} as const;

/**
 * The NUVEI theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Nuvei-specific (deep-indigo-on-white
 * fintech) values, and the `component` layer is REBUILT from this theme's own
 * semantic / foundation via `createComponent` — so Nuvei's indigo CTA, cyan
 * links, boxed fields and cyan focus ring reach the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const nuveiTheme: TenantTheme = {
  id: "nuvei",
  label: "Nuvei",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default nuveiTheme;
