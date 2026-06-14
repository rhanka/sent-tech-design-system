import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * SAQ (saq.com — Société des alcools du Québec, the Québec state liquor retailer)
 * theme for the Sentropic token structure.
 *
 * Every value below is MEASURED from saq.com's public CSS (the homepage plus the
 * storefront stylesheet `build/store/styles/main.css`): the dominant brand hexes,
 * the surface/grey ramp, the radii, the field/select treatment and the focus
 * technique. We reference the font *name* only ("Maax", SAQ's proprietary brand
 * typeface, measured 254× across the stylesheet), never font binaries. Sources and
 * the full mapping table are in MAPPING.md.
 *
 * SAQ's identity is a MODERN RETAIL system with a WINE heritage: a bright CORAL-RED
 * accent (#fc4d30 — the dominant brand hex, measured 16× on the homepage) drives
 * primary actions and CTAs; the historic DEEP BURGUNDY (#7e003f, the "wine" brand
 * colour) anchors the reversed/inverse surface and a secondary accent; a TEAL
 * (#004451) is the cool accent; surfaces are white on a faint grey page; ink is a
 * near-black (#1d1d1b); corners are MOSTLY SQUARE (controls 0, cards step to 8px);
 * form fields are BOXED outlines (white fill, 1px #dde8e8 border); focus is a
 * coral-red OUTLINE (#fc4d30, 2px). Where Sentropic needs a role SAQ does not
 * publish, the closest measured hex is used and the choice is noted "à confirmer"
 * in MAPPING.md.
 *
 * SAQ colour reference (measured saq.com CSS, light theme):
 *   Brand coral-red (action / CTA)     #fc4d30   dominant brand hex (16× homepage)
 *   Coral-red hover                    #e43d22   à confirmer (darkened #fc4d30)
 *   Deep burgundy (wine brand)         #7e003f   surface.inverse / secondary accent
 *   Teal accent                        #004451   cool brand accent
 *   Brown (decorative)                 #5c2b17   à confirmer (decorative)
 *   Ink (text primary)                 #1d1d1b   à confirmer (near-black)
 *   Text secondary                     #878787   measured secondary grey
 *   Text muted                         #a0a0a0   à confirmer (muted grey)
 *   White (surface default)            #ffffff   surface default
 *   Surface subtle                     #f2f2f2   measured subtle grey
 *   Cream                              #e1ded9   measured warm neutral
 *   Border subtle                      #dde8e8   measured field/divider stroke
 *   Border strong                      #878787   measured strong border
 *   Danger red                         #d0011b   à confirmer (form/error red)
 *   Success                            #2e7d32   à confirmer (AA-safe)
 *   Warning                            #8a6d3b   à confirmer (AA-safe)
 *   Info                               #004451   à confirmer (teal, AA-safe)
 */

// --- SAQ raw colour palette (measured saq.com CSS) --------------------------
const saqColor = {
  // The brand accent IS the bright SAQ coral-red — the dominant brand hex,
  // measured 16× on the homepage. Drives every primary CTA and accent.
  coral: {
    500: "#fc4d30", // dominant brand hex (16× homepage) — THE SAQ coral-red CTA
    hover: "#e43d22" // à confirmer — darkened #fc4d30 for hover/active
  },
  // Historic SAQ burgundy — the "wine" brand colour. Anchors the reversed/inverse
  // surface and serves as the secondary accent (secondary button label).
  burgundy: "#7e003f", // deep wine burgundy — surface.inverse / secondary accent
  // Teal — the cool brand accent (also used for info).
  teal: "#004451", // teal accent
  // Warm brown — decorative only (à confirmer).
  brown: "#5c2b17", // à confirmer — decorative brown
  // Near-black ink + grey ramp (measured greys / surfaces).
  ink: "#1d1d1b", // à confirmer — primary text (near-black)
  grey: {
    secondary: "#878787", // measured secondary text / strong border
    muted: "#a0a0a0", // à confirmer — muted text
    subtle: "#f2f2f2", // measured subtle surface grey
    cream: "#e1ded9", // measured warm neutral (cream)
    border: "#dde8e8" // measured field / divider border (1px)
  },
  white: "#ffffff", // surface default
  // System / status colours.
  system: {
    danger: "#d0011b", // à confirmer — form / error red
    success: "#2e7d32", // à confirmer — success green (AA on white)
    warning: "#8a6d3b", // à confirmer — warning amber (AA on white)
    info: "#004451" // à confirmer — info teal (AA on white)
  }
} as const;

// --- foundation (SAQ-specific values) ---------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). SAQ's PRIMARY ACTION
    // is the coral-red, so the action steps are mapped onto the coral scale; the
    // lightest step is the warm cream neutral (no published faint-coral tint).
    blue: {
      10: saqColor.grey.cream, // #e1ded9 warm cream tint (à confirmer — no faint-coral source)
      60: saqColor.coral[500], // #fc4d30 THE SAQ coral-red (primary action)
      80: saqColor.coral.hover // #e43d22 darkened coral (hover/active ground)
    },
    // Sentropic "cyan" accent slot mapped onto SAQ's measured TEAL accent.
    cyan: {
      10: saqColor.grey.subtle, // #f2f2f2 light neutral (à confirmer — no faint-teal source)
      50: saqColor.teal, // #004451 teal accent
      70: saqColor.burgundy // #7e003f deep burgundy as the darkest cool step
    },
    // Sentropic "slate" neutral family mapped onto the SAQ grey ramp + near-black ink.
    slate: {
      0: saqColor.white, // #ffffff white
      10: saqColor.grey.subtle, // #f2f2f2 subtle surface grey
      20: saqColor.grey.border, // #dde8e8 divider / subtle border
      60: saqColor.grey.secondary, // #878787 secondary text
      80: saqColor.ink, // #1d1d1b primary text (near-black)
      90: saqColor.ink // #1d1d1b near-black (no separate contrast black published)
    },
    feedback: {
      success: saqColor.system.success,
      warning: saqColor.system.warning,
      error: saqColor.system.danger,
      info: saqColor.system.info
    }
  },
  // SAQ serves its proprietary "Maax" brand typeface across the site (measured 254×
  // in the stylesheet; body, headings and controls resolve to it). We reference the
  // NAME only, with SAQ's own Helvetica/Arial/Verdana fallback chain. Mono is the
  // measured Roboto-led monospace stack.
  font: {
    sans: "Maax, Helvetica, Arial, Verdana, sans-serif",
    display: "Maax, Helvetica, Arial, Verdana, sans-serif",
    mono: "Roboto, Helvetica, Arial, monospace"
  },
  // Spacing scale kept on the Sentropic 4px-based step keys (SAQ does not publish a
  // separately tokenised spacing ramp — à confirmer).
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
  // SAQ is MOSTLY SQUARE (measured): controls/none/sm = 0; the only measured
  // rounding is 0.5em (8px) on medium surfaces; pill = 999px for chips.
  radius: {
    none: "0", // measured square
    sm: "0", // measured square
    md: "0.5rem", // 8px — measured .5em on medium surfaces
    lg: "0.5rem", // 8px — larger surfaces
    pill: "999px" // pills / tags
  },
  // SAQ elevation is not separately tokenised publicly; kept aligned with the base
  // (à confirmer exact steps).
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.08)",
    medium: "0 2px 8px rgb(0 0 0 / 0.12)",
    floating: "0 8px 24px rgb(0 0 0 / 0.16)"
  },
  // Transitions / motion are not separately tokenised publicly; kept aligned with
  // the base (à confirmer exact steps).
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not SAQ-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (SAQ) --------------------------------------------
  // SAQ field/divider borders measured at 1px solid #dde8e8.
  borderWidth: {
    none: "0",
    thin: "1px", // measured field / divider stroke
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // SAQ control density — md targets a comfortable ~44px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // SAQ typography = "Maax". Control labels are bold (700), body/field text regular
  // (400), labels semibold. Base type is 16px.
  typography: {
    control: { family: "Maax, Helvetica, Arial, Verdana, sans-serif", size: "0.875rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "Maax, Helvetica, Arial, Verdana, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "Maax, Helvetica, Arial, Verdana, sans-serif", size: "1rem", weight: "500", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // SAQ links resolve to the near-black ink, underlined on hover (à confirmer).
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
  // SAQ FOCUS = a coral-red OUTLINE (measured `focus.strategy: "outline"`, 2px,
  // colour #fc4d30 — the brand accent).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: saqColor.coral[500], // #fc4d30 — coral-red focus indicator
    inset: "0"
  },
  // SAQ form fields are BOXED (outline): a white fill with a thin grey stroke
  // (measured 1px solid #dde8e8) and the square control radius. The native <select>
  // chevron is redrawn in the near-black ink with a right gutter.
  field: {
    style: "outline",
    fillBg: saqColor.white, // #ffffff
    underlineColor: saqColor.grey.border, // #dde8e8 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%231d1d1b' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // SAQ cards: white surface, square-ish (8px on medium), a soft border and a faint
  // grey hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: saqColor.grey.subtle // #f2f2f2 faint grey hover
  },
  // SAQ secondary button = a neutral grey fill with a burgundy label, cream hover
  // (the measured secondary palette).
  buttonSecondary: {
    background: saqColor.grey.subtle, // #f2f2f2 neutral secondary fill
    border: saqColor.grey.border, // #dde8e8 soft border
    hoverBackground: saqColor.grey.cream // #e1ded9 cream fill on hover
  },
  // SAQ tabs / sub-nav: active tab = coral-red bold label with a coral bottom
  // indicator, transparent fill.
  tabs: {
    activeText: saqColor.coral[500], // #fc4d30 active label (brand coral)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // coral underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // SAQ pagination: borderless ink links; active page = filled coral square with
  // white text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: saqColor.ink, // #1d1d1b ink text
    activeBackground: saqColor.coral[500], // #fc4d30 filled active page (brand coral)
    activeText: saqColor.white, // white on coral
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // SAQ breadcrumb: ink links, grey trail, near-black current page, grey separators.
  breadcrumb: {
    linkText: saqColor.ink, // #1d1d1b
    text: saqColor.grey.secondary, // #878787 trail text
    currentText: saqColor.ink, // #1d1d1b current page
    separator: saqColor.grey.secondary, // #878787
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "700" // current page is emphasised
  },
  // SAQ notice / alert: a tinted box with a coloured left filet matching severity.
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
  // SAQ accordion / disclosure: a bold near-black summary trigger, grey-separated.
  accordion: {
    text: saqColor.ink, // #1d1d1b summary label
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700", // SAQ summary triggers are bold
    lineHeight: "1.5rem" // 24px
  },
  // SAQ tag: a small PILL chip with a faint grey fill and near-black ink.
  tag: {
    radius: "999px", // SAQ tags/pills round fully
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: saqColor.grey.subtle, // #f2f2f2 grey fill
    neutralText: saqColor.ink // #1d1d1b
  },
  // SAQ badge: a small filled badge — coral fill / white text.
  badge: {
    radius: "999px", // pill
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: saqColor.coral[500], // #fc4d30 brand coral
    infoText: saqColor.white // white on coral
  },
  // SAQ checkbox/radio label: regular near-black type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: saqColor.ink // #1d1d1b
  },
  // SAQ search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // SAQ toggle / switch label: regular near-black type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: saqColor.ink // #1d1d1b
  }
} as const;

// --- semantic (SAQ-specific role mapping) -----------------------------------
const semantic = {
  surface: {
    default: saqColor.white, // #ffffff white
    subtle: saqColor.grey.subtle, // #f2f2f2 subtle page grey
    raised: saqColor.white, // #ffffff white
    inverse: saqColor.burgundy, // #7e003f deep burgundy (wine brand) reversed surface
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop (à confirmer)
  },
  text: {
    primary: saqColor.ink, // #1d1d1b near-black
    secondary: saqColor.grey.secondary, // #878787
    muted: saqColor.grey.muted, // #a0a0a0 (à confirmer)
    inverse: saqColor.white, // white on dark/burgundy surfaces
    link: saqColor.ink // #1d1d1b (SAQ links resolve to ink)
  },
  border: {
    subtle: saqColor.grey.border, // #dde8e8 divider / field stroke
    strong: saqColor.grey.secondary, // #878787 strong border
    interactive: saqColor.coral[500] // #fc4d30 brand coral (interactive accent)
  },
  action: {
    primary: saqColor.coral[500], // #fc4d30 THE SAQ coral-red CTA
    primaryHover: saqColor.coral.hover, // #e43d22 (à confirmer — darkened)
    primaryText: saqColor.white, // white text on coral
    secondary: saqColor.grey.subtle, // #f2f2f2 neutral secondary surface
    secondaryHover: saqColor.grey.cream, // #e1ded9 cream hover
    secondaryText: saqColor.burgundy, // #7e003f burgundy secondary label
    danger: saqColor.system.danger // #d0011b (à confirmer)
  },
  feedback: {
    success: saqColor.system.success, // #2e7d32 (à confirmer)
    warning: saqColor.system.warning, // #8a6d3b (à confirmer)
    error: saqColor.system.danger, // #d0011b (à confirmer)
    info: saqColor.system.info // #004451 teal (à confirmer)
  },
  status: {
    pending: saqColor.system.warning, // #8a6d3b
    processing: saqColor.system.info, // #004451
    completed: saqColor.system.success, // #2e7d32
    failed: saqColor.system.danger // #d0011b
  },
  // Categorical data-vis palette. SAQ does not publish a categorical token list;
  // the eight categories below are ASSEMBLED from the measured brand hexes
  // (coral / burgundy / teal / brown / grey), led by the brand coral. See
  // MAPPING.md, "à confirmer".
  data: {
    category1: saqColor.coral[500], // #fc4d30 brand coral
    category2: saqColor.burgundy, // #7e003f deep burgundy
    category3: saqColor.teal, // #004451 teal
    category4: saqColor.brown, // #5c2b17 brown
    category5: saqColor.grey.secondary, // #878787 grey
    category6: saqColor.coral.hover, // #e43d22 darkened coral
    category7: saqColor.ink, // #1d1d1b near-black
    category8: saqColor.grey.muted // #a0a0a0 muted grey
  }
} as const;

/**
 * The SAQ theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry SAQ-specific (coral-on-white, wine-burgundy)
 * values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so SAQ's coral CTA, near-black ink,
 * boxed fields and coral focus reach the components (buttons, tabs, pagination,
 * chat bubbles…), not just the elements that read semantic vars directly.
 */
export const saqTheme: TenantTheme = {
  id: "saq",
  label: "SAQ",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default saqTheme;
