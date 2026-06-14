import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * CGI INC. (cgi.com — the Montréal-headquartered global IT and business
 * consulting firm) theme for the Sentropic token structure.
 *
 * Every value below is MEASURED from CGI's live stylesheet bundle
 * (cgi.com/sites/default/files/css/*), with hex frequencies counted across the
 * compiled CSS. We reference font *names* only ("Source Sans Pro" for body,
 * "Nunito Sans" for headings — measured from the site's `font-family`
 * declarations), never font binaries. Sources and the full mapping table are in
 * MAPPING.md.
 *
 * CGI's MODERN identity is PURPLE-LED: the dominant brand hex is a deep violet
 * `#5236ab` (measured 252×) that drives every primary action, links and the
 * interactive border; hover/active deepen to a near-black indigo `#200a58`
 * (measured 42×); a brighter `#7a5aed` is the lifted variant. CGI's CLASSIC red
 * `#e41937` (measured 87×) is its HERITAGE accent — used here as `action.danger`
 * AND a data/accent colour. Surfaces are white on a faint grey page; ink is a
 * near-black `#151515`; secondary text is a measured teal-grey `#407080`; corners
 * are tight (4px on controls); form fields are BOXED outlines (white fill, 1px
 * `#d2d2d2` stroke, 4px radius) and focus is a 2px purple outline `#5236ab`.
 * Where Sentropic needs a role CGI does not publish a clean value for, the closest
 * measured colour is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * CGI colour reference (measured from the compiled CSS, light theme):
 *   Brand purple (action / brand / link)  #5236ab   dominant brand hex (252×)
 *   Deep indigo (hover / inverse surface)  #200a58   measured deep-indigo (42×)
 *   Bright purple (lifted variant)         #7a5aed   measured bright variant
 *   Magenta-purple (accent)                #762f8f   measured magenta-purple
 *   Light purple tint (secondary surface)  #ece9f6   measured light purple tint
 *   Subtle purple-white                    #f8f8fc   measured near-white purple
 *   Classic CGI red (danger / heritage)    #e41937   measured (87×)
 *   Ink (text primary)                     #151515   measured near-black
 *   Teal-grey (text secondary / info)      #407080   measured teal-grey
 *   Muted grey (text muted)                #767676   measured (à confirmer)
 *   White (surface default / inverse ink)  #ffffff   measured
 *   Page grey (subtle surface)             #f8f8f8   measured
 *   Border subtle (field stroke)           #d2d2d2   measured
 *   Border strong                          #767676   measured
 *   Cyan accent (data)                     #009ee0   measured (à confirmer)
 *   Amber (warning / data)                 #b26a00   AA-safe amber (à confirmer)
 *   Success green                          #2e7d32   AA-safe green (à confirmer)
 */

// --- CGI raw colour palette (measured from cgi.com compiled CSS) -------------
const cgiColor = {
  // CGI's modern identity is PURPLE-led. This violet is the dominant brand hex
  // across the compiled CSS (252×): primary CTAs, links, interactive borders.
  purple: {
    500: "#5236ab", // dominant brand purple (252×) — THE CGI purple (primary action / link)
    900: "#200a58", // deep indigo (42×) — primary hover/active + inverse surface
    400: "#7a5aed", // bright purple — lifted variant / data accent
    magenta: "#762f8f", // magenta-purple — secondary brand accent / data
    100: "#ece9f6", // light purple tint — secondary action surface
    50: "#f8f8fc" // subtle purple-white — faintest brand-tinted surface
  },
  // CGI's CLASSIC red — its heritage accent. Used as danger AND a data colour.
  red: "#e41937", // classic CGI red (87×) — action.danger + heritage data accent
  // Near-black ink (CGI body text is a deep near-black, not pure #000).
  ink: "#151515", // text primary — measured near-black ink
  // Teal-grey secondary ink (a measured cool grey used for secondary text/info).
  teal: "#407080", // text secondary — measured teal-grey
  // Neutral greys.
  grey: {
    muted: "#767676", // text muted / border strong — measured (à confirmer for muted role)
    border: "#d2d2d2", // border subtle / field stroke — measured 1px stroke
    page: "#f8f8f8", // subtle page surface — measured
    white: "#ffffff" // surface default / raised / inverse text
  },
  // System / status colours. CGI's red is measured; success/amber/cyan are
  // AA-safe choices for the roles CGI does not publish cleanly (à confirmer).
  system: {
    success: "#2e7d32", // AA-safe success green (à confirmer)
    warning: "#b26a00", // AA-safe amber (à confirmer)
    error: "#e41937", // classic CGI red (measured) — error
    info: "#407080", // teal-grey info (à confirmer, AA-safe)
    cyan: "#009ee0" // bright cyan data accent (à confirmer)
  }
} as const;

// --- foundation (CGI-specific values) ---------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). CGI's PRIMARY is
    // purple, so the action steps map onto the purple scale; the lightest step is
    // the faint purple tint.
    blue: {
      10: cgiColor.purple[100], // #ece9f6 light purple tint
      60: cgiColor.purple[500], // #5236ab THE CGI purple (primary action)
      80: cgiColor.purple[900] // #200a58 deep indigo (hover/active/border ground)
    },
    // Sentropic "cyan" accent slot. CGI's measured bright cyan #009ee0 is the
    // closest cool accent (à confirmer — see MAPPING); deepened toward indigo for
    // the strongest step.
    cyan: {
      10: cgiColor.purple[100], // #ece9f6 light purple tint (cool tint)
      50: cgiColor.system.cyan, // #009ee0 bright cyan accent (à confirmer)
      70: cgiColor.purple[900] // #200a58 deep indigo
    },
    // Sentropic "slate" neutral family mapped onto CGI's grey ramp + near-black ink.
    slate: {
      0: cgiColor.grey.white, // #ffffff white
      10: cgiColor.grey.page, // #f8f8f8 page grey
      20: cgiColor.grey.border, // #d2d2d2 subtle border / divider
      60: cgiColor.teal, // #407080 secondary text (teal-grey)
      80: cgiColor.ink, // #151515 primary text (near-black)
      90: cgiColor.ink // #151515 contrast ink
    },
    feedback: {
      success: cgiColor.system.success,
      warning: cgiColor.system.warning,
      error: cgiColor.system.error,
      info: cgiColor.system.info
    }
  },
  // CGI serves "Source Sans Pro" for body/UI (measured 84× in the compiled CSS)
  // and "Nunito Sans" for headings (measured 49×). We reference the NAMES only,
  // with system fallbacks. Mono is not part of CGI — the Sentropic mono stack is
  // kept (a ui-monospace-led stack).
  font: {
    sans: "'Source Sans Pro', system-ui, sans-serif",
    display: "'Nunito Sans', sans-serif",
    mono: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // CGI spacing: a standard 4px-based ramp aligned to the Sentropic step keys
  // (exact published spacing tokens are not separately exposed — à confirmer).
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
  // CGI rounds TIGHTLY — measured radii: sm 3px, md 4px, lg 4px, none 0,
  // pill 999px (measured ~30px pills).
  radius: {
    none: "0", // measured square edges
    sm: "3px", // measured small radius
    md: "4px", // measured control radius (button / input / select)
    lg: "4px", // measured — CGI does not step cards up; stays at 4px
    pill: "999px" // measured pills (~30px → fully rounded)
  },
  // Elevation is not separately tokenised by CGI; a soft neutral ramp is used
  // (à confirmer — kept aligned with the base, slightly softened).
  shadow: {
    subtle: "0px 1px 2px rgb(21 21 21 / 0.08)",
    medium: "0px 2px 8px rgb(21 21 21 / 0.12)",
    floating: "0px 8px 24px rgb(21 21 21 / 0.16), 0px 2px 2px rgb(21 21 21 / 0.08)"
  },
  // CGI transitions are short and standard; exact durations are not separately
  // tokenised publicly (à confirmer — kept aligned with the base).
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not CGI-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (CGI) --------------------------------------------
  // CGI field/select borders measured at 1px solid #d2d2d2.
  borderWidth: {
    none: "0",
    thin: "1px", // measured field/select stroke (1px solid #d2d2d2)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // CGI control density: comfortable ~44px md control; sm/lg bracket it
  // (heights aligned with the base; exact published density not exposed —
  // à confirmer).
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // CGI typography: body/UI = "Source Sans Pro", headings = "Nunito Sans".
  // Control labels are semibold; body/field text regular (400). Base type 16px.
  typography: {
    control: { family: "'Source Sans Pro', system-ui, sans-serif", size: "1rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Source Sans Pro', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Source Sans Pro', system-ui, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // CGI headings use the display face "Nunito Sans"; links are purple, underlined
    // on hover (measured anchor colour #5236ab).
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
  // CGI FOCUS = a 2px PURPLE OUTLINE (`#5236ab`, the brand purple), 2px offset.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: cgiColor.purple[500], // #5236ab — brand-purple focus indicator
    inset: "0"
  },
  // CGI form fields are BOXED (outline): white fill, a thin grey stroke (measured
  // 1px solid #d2d2d2) and a 4px radius. The native <select> chevron is redrawn in
  // the brand purple with a right gutter (appearance: none).
  field: {
    style: "outline",
    fillBg: cgiColor.grey.white, // #ffffff
    underlineColor: cgiColor.grey.border, // #d2d2d2 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%235236ab' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // CGI cards: white surface, tight 4px corners, soft grey border, faint
  // purple-tinted hover (the measured light purple tint).
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: cgiColor.purple[50] // #f8f8fc subtle purple-white hover
  },
  // CGI secondary button = light purple fill, purple text (measured light purple
  // tint surface with brand-purple ink).
  buttonSecondary: {
    background: cgiColor.purple[100], // #ece9f6 light purple surface
    border: cgiColor.purple[100], // #ece9f6 (borderless tinted fill)
    hoverBackground: "#d9d0f0" // slightly deeper purple tint on hover (à confirmer)
  },
  // CGI tabs / sub-nav: active tab = bold purple label with a purple bottom
  // indicator, transparent fill.
  tabs: {
    activeText: cgiColor.purple[500], // #5236ab active label (brand purple)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // purple underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // CGI pagination: borderless purple link text; active page = filled purple
  // square with white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: cgiColor.purple[500], // #5236ab link text
    activeBackground: cgiColor.purple[500], // #5236ab filled active page (brand purple)
    activeText: cgiColor.grey.white, // white on purple
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // CGI breadcrumb: purple links, teal-grey trail, near-black current page.
  breadcrumb: {
    linkText: cgiColor.purple[500], // #5236ab
    text: cgiColor.teal, // #407080 trail text
    currentText: cgiColor.ink, // #151515 current page
    separator: cgiColor.teal, // #407080
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page emphasised
  },
  // CGI notice / alert: a tinted box with a coloured left filet matching severity.
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
  // CGI accordion / disclosure: a semibold near-black summary trigger.
  accordion: {
    text: cgiColor.ink, // #151515 summary label
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600", // CGI summary triggers are semibold
    lineHeight: "1.5rem" // 24px
  },
  // CGI tag: a small PILL chip with a faint purple fill and brand-purple ink.
  tag: {
    radius: "999px", // CGI tags/pills round fully
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: cgiColor.purple[100], // #ece9f6 light purple fill
    neutralText: cgiColor.purple[500] // #5236ab brand purple ink
  },
  // CGI badge: a small filled badge — brand purple fill / white text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: cgiColor.purple[500], // #5236ab brand purple
    infoText: cgiColor.grey.white // white on purple
  },
  // CGI checkbox/radio label: regular near-black type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: cgiColor.ink // #151515
  },
  // CGI search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // CGI toggle / switch label: regular near-black type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: cgiColor.ink // #151515
  }
} as const;

// --- semantic (CGI-specific role mapping) -----------------------------------
const semantic = {
  surface: {
    default: cgiColor.grey.white, // #ffffff white
    subtle: cgiColor.grey.page, // #f8f8f8 page grey
    raised: cgiColor.grey.white, // #ffffff white
    inverse: cgiColor.purple[900], // #200a58 deep indigo reversed surface
    overlay: "rgb(21 21 21 / 0.6)" // modal backdrop — near-black ink at 60%
  },
  text: {
    primary: cgiColor.ink, // #151515 near-black ink
    secondary: cgiColor.teal, // #407080 teal-grey
    muted: cgiColor.grey.muted, // #767676 (à confirmer)
    inverse: cgiColor.grey.white, // white on dark/purple surfaces
    link: cgiColor.purple[500] // #5236ab brand purple
  },
  border: {
    subtle: cgiColor.grey.border, // #d2d2d2 divider / field stroke
    strong: cgiColor.grey.muted, // #767676 strong border
    interactive: cgiColor.purple[500] // #5236ab brand purple (interactive accent)
  },
  action: {
    primary: cgiColor.purple[500], // #5236ab THE CGI purple CTA
    primaryHover: cgiColor.purple[900], // #200a58 deep indigo hover
    primaryText: cgiColor.grey.white, // white text on purple
    secondary: cgiColor.purple[100], // #ece9f6 light purple secondary surface
    secondaryHover: "#d9d0f0", // deeper purple tint on hover (à confirmer)
    secondaryText: cgiColor.purple[500], // #5236ab brand-purple secondary label
    danger: cgiColor.red // #e41937 classic CGI red
  },
  feedback: {
    success: cgiColor.system.success, // #2e7d32 (à confirmer)
    warning: cgiColor.system.warning, // #b26a00 (à confirmer)
    error: cgiColor.system.error, // #e41937 classic CGI red
    info: cgiColor.system.info // #407080 teal-grey (à confirmer)
  },
  status: {
    pending: cgiColor.system.warning, // #b26a00
    processing: cgiColor.system.info, // #407080
    completed: cgiColor.system.success, // #2e7d32
    failed: cgiColor.system.error // #e41937
  },
  // Categorical data-vis palette. CGI's rich measured brand palette is led by the
  // brand purple and its heritage red, with magenta, bright purple, deep indigo,
  // teal-grey and the cyan/amber accents (à confirmer for #009ee0 / #b26a00).
  data: {
    category1: cgiColor.purple[500], // #5236ab brand purple
    category2: cgiColor.red, // #e41937 classic CGI red (heritage accent)
    category3: cgiColor.teal, // #407080 teal-grey
    category4: cgiColor.purple.magenta, // #762f8f magenta-purple
    category5: cgiColor.purple[400], // #7a5aed bright purple
    category6: cgiColor.purple[900], // #200a58 deep indigo
    category7: cgiColor.system.cyan, // #009ee0 bright cyan (à confirmer)
    category8: cgiColor.system.warning // #b26a00 amber (à confirmer)
  }
} as const;

/**
 * The CGI theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry CGI-specific (purple-on-white IT-consulting)
 * values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so CGI's purple CTA, near-black ink,
 * boxed fields and purple focus reach the components (buttons, tabs, pagination,
 * chat bubbles…), not just the elements that read semantic vars directly.
 */
export const cgiTheme: TenantTheme = {
  id: "cgi",
  label: "CGI",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default cgiTheme;
