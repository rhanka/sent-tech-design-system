import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * GENETEC (genetec.com — the Montréal physical-security, video-surveillance &
 * unified-security software vendor) theme for the Sentropic token structure.
 *
 * Every value below is MEASURED from the live genetec.com front-end. The site is
 * a React/Material-UI single-page app whose brand palette is shipped as a NAMED
 * token object inside the Genetec "global elements" web-component bundle
 * (gntc-global-elements.bundle.js):
 *
 *   { charcol1:"#22282f", charcol2:"#363c43", charcol3:"#0e141b",
 *     charcol4:"#2c3239", charcol5:"#181e25", charcol6:"#262B31",
 *     eggshell:"#f0f0f0", blue1:"#00aeef", blue2:"#3dc1f3", blue3:"#007fbc",
 *     white:"#ffffff", black:"#000000", lightGrey:"#C2C8CF",
 *     mediumBorder:"#3E464F", border:"#898C8F" }
 *
 * and as the MUI theme palette in the app bundle (main.*.js):
 *   primary   { main:#22282f, light:#363c43, dark:#0e141b, contrastText:#f0f0f0 }
 *   secondary { main:#00aeef, light:#3dc1f3, lighter:#66e0ff, dark:#007fbc,
 *               contrastText:#22282f }
 *
 * Genetec's identity is a CONFIDENT CHARCOAL-AND-CYAN enterprise-security system:
 * a deep CHARCOAL `#22282f` (charcol1) is the primary ink, brand mark and dark
 * surfaces; the signature ELECTRIC CYAN `#00aeef` (blue1) is the accent / link /
 * focus / interactive hue; surfaces are WHITE on a faint EGGSHELL `#f0f0f0`; form
 * fields are BOXED outlines (white fill, thin grey stroke) with a 4px control
 * radius (the dominant `borderRadius:"4px"` in the MUI theme). We reference the
 * brand faces "Circular" (the lineto Circular webfont served as the body + UI
 * face — measured `font-family: Circular, helvetica, arial, sans-serif`) and the
 * serif "Garamond Premier Pro" (the secondary display face) by NAME only, never
 * font binaries. Sources and the full mapping are in MAPPING.md; values not
 * measured from a single source are flagged "à confirmer".
 *
 * Genetec colour reference (measured hex, brand token object + MUI palette):
 *   Charcoal (ink / brand / dark surface)   #22282f   primary text / brand / dark surface (charcol1)
 *   Charcoal light (raised dark / hover)    #363c43   raised dark surface / primary light (charcol2)
 *   Charcoal deep (darkest)                 #0e141b   darkest surface / primary dark (charcol3)
 *   Charcoal alt                            #2c3239   dark surface alt (charcol4)
 *   Charcoal night                          #181e25   night surface (charcol5)
 *   Charcoal stone                          #262b31   stone surface (charcol6)
 *   Electric cyan (accent / link / focus)   #00aeef   accent / link / focus / interactive (blue1)
 *   Cyan light                              #3dc1f3   lighter accent (blue2)
 *   Cyan lighter                            #66e0ff   lightest accent (secondary.lighter)
 *   Cyan dark                               #007fbc   accent hover / dark (blue3)
 *   White (surface default)                 #ffffff   surface default / accent text
 *   Eggshell (subtle surface)               #f0f0f0   faint page eggshell / contrastText
 *   Light grey (subtle border)              #c2c8cf   subtle border / divider (lightGrey)
 *   Medium border                           #3e464f   strong border on dark (mediumBorder)
 *   Border grey                             #898c8f   default border / muted ink (border)
 *   Black                                   #000000   pure black (rare)
 *   Success green                           #15d08d   success feedback (brand green, measured in nav bundle)
 *   Warning amber ink                       #b26a00   warning feedback (AA-grade amber — à confirmer)
 *   Error red                               #d32f2f   error feedback (à confirmer)
 *   Info cyan                               #00aeef   info feedback (the brand cyan)
 */

// --- GENETEC raw colour palette (measured hex, brand token object) ----------
const genetecColor = {
  // Charcoal family — Genetec's brand ink and full range of dark surfaces.
  charcoal: {
    1: "#22282f", // primary text / brand / dark surface (charcol1) — THE Genetec charcoal
    2: "#363c43", // raised dark surface / primary light (charcol2)
    3: "#0e141b", // darkest surface / primary dark (charcol3)
    4: "#2c3239", // dark surface alt (charcol4)
    5: "#181e25", // night surface (charcol5)
    6: "#262b31" // stone surface (charcol6)
  },
  // Electric cyan — the signature Genetec accent / link / focus / interactive hue.
  cyan: {
    500: "#00aeef", // accent / link / focus (blue1) — THE Genetec cyan
    400: "#3dc1f3", // lighter accent (blue2)
    300: "#66e0ff", // lightest accent (secondary.lighter)
    700: "#007fbc" // accent hover / dark (blue3)
  },
  // Neutral / grey scale.
  grey: {
    eggshell: "#f0f0f0", // faint page eggshell / contrastText (eggshell)
    light: "#c2c8cf", // subtle border / divider (lightGrey)
    medium: "#3e464f", // strong border on dark (mediumBorder)
    border: "#898c8f" // default border / muted ink (border)
  },
  white: "#ffffff", // surface default / accent text
  black: "#000000", // pure black (rare)
  // System / status colours (success measured in nav bundle; others à confirmer).
  system: {
    success: "#15d08d", // success feedback (brand green, measured in nav bundle)
    warning: "#b26a00", // warning feedback (AA-grade amber — à confirmer)
    error: "#d32f2f", // error feedback (à confirmer)
    info: "#00aeef" // info feedback (the brand cyan)
  }
} as const;

// --- foundation (GENETEC-specific values) -----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family (action / primary / link). Genetec's PRIMARY
    // ACTION ink is the dark CHARCOAL, so the action steps are mapped to the
    // charcoal scale; the lightest step is the faint eggshell.
    blue: {
      10: genetecColor.grey.eggshell, // #f0f0f0 faint eggshell tint
      60: genetecColor.charcoal[1], // #22282f THE Genetec charcoal (primary action)
      80: genetecColor.charcoal[3] // #0e141b deepest charcoal (hover/active ground)
    },
    // Sentropic "cyan" accent slot. Genetec's cool accent IS the electric cyan
    // family — a direct, measured match.
    cyan: {
      10: "#e5f7fe", // faint cyan tint (derived panel tint — à confirmer)
      50: genetecColor.cyan[500], // #00aeef electric cyan accent
      70: genetecColor.cyan[700] // #007fbc deep cyan
    },
    // Sentropic "slate" neutral family mapped onto the Genetec charcoal + grey ramp.
    slate: {
      0: genetecColor.white, // #ffffff white
      10: genetecColor.grey.eggshell, // #f0f0f0 page eggshell
      20: genetecColor.grey.light, // #c2c8cf subtle border / divider
      60: genetecColor.grey.border, // #898c8f muted text / default border
      80: genetecColor.charcoal[2], // #363c43 secondary text (charcoal light)
      90: genetecColor.charcoal[1] // #22282f strongest ink (charcoal)
    },
    feedback: {
      success: genetecColor.system.success,
      warning: genetecColor.system.warning,
      error: genetecColor.system.error,
      info: genetecColor.system.info
    }
  },
  // Genetec serves "Circular" (the lineto Circular webfont) as its body + UI face
  // (measured `font-family: Circular, helvetica, arial, sans-serif`), with the
  // serif "Garamond Premier Pro" as the secondary display face. We reference the
  // family NAMES only. Mono is not part of Genetec — the Sentropic ui-monospace
  // stack is kept.
  font: {
    sans: "Circular, helvetica, arial, sans-serif",
    display: "Circular, helvetica, arial, sans-serif",
    mono: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Genetec spacing: a 4/8px-based ramp aligned to the Sentropic step keys.
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
  // Genetec radii: the MUI theme's dominant control radius is 4px (`borderRadius:
  // "4px"`, 55×). sm chips 2px, md controls/inputs 4px, cards 8px, pill 999px.
  radius: {
    none: "0", // square
    sm: "2px", // small chips (à confirmer)
    md: "4px", // controls / inputs (measured MUI borderRadius:"4px")
    lg: "8px", // cards / larger surfaces (à confirmer)
    pill: "999px" // fully-rounded chips (à confirmer)
  },
  // Genetec elevation (à confirmer — mapped to the three Sentropic slots).
  shadow: {
    subtle: "0 1px 3px rgb(0 0 0 / 0.12)",
    medium: "0 4px 8px rgb(0 0 0 / 0.10)",
    floating: "0 8px 24px rgb(0 0 0 / 0.16), 0 2px 4px rgb(0 0 0 / 0.10)"
  },
  // Genetec transitions are short and standard; exact step ramp not separately
  // tokenised, kept aligned with the base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "320ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not Genetec-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (GENETEC) ----------------------------------------
  // Genetec field/divider strokes are a 1px solid light-grey (#c2c8cf); strong
  // borders are the dark mediumBorder #3e464f. thick 2px kept for emphasis.
  borderWidth: {
    none: "0",
    thin: "1px", // input + divider stroke
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Genetec control density. md targets a comfortable ~44px control; sm/lg bracket it.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0.5rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.625rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.75rem", paddingInline: "1.75rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1rem" }
  },
  // Genetec typography = "Circular" across control labels, field text and labels.
  // Base type is 18px (measured MUI `fontSize:18`).
  typography: {
    control: { family: "Circular, helvetica, arial, sans-serif", size: "1rem", weight: "500", lineHeight: "1.125", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "Circular, helvetica, arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.25", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "Circular, helvetica, arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Genetec links: electric cyan, underline on hover (à confirmer — anchors
    // resolve to the cyan accent).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.38", // Genetec/MUI disables controls at ≈ 38% (measured MUI text.disabled rgba 0.38)
  transition: { property: "background-color, border-color, color, outline-color, box-shadow", duration: "150ms", easing: "ease-in-out" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.25rem", lg: "1.5rem" },
  // GENETEC FOCUS = a cyan accent indicator. The hover state on interactive
  // elements is a `1px solid #00aeef` border (measured), so we encode a 2px cyan
  // outline as the focus ring — the accessible interactive hue.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: genetecColor.cyan[500], // #00aeef — electric-cyan focus indicator
    inset: "0"
  },
  // GENETEC form fields are BOXED (outline): a white fill with a thin light-grey
  // stroke. `style: "outline"` makes the builder draw four equal borders from
  // `surface.default` + `border.subtle`. The native <select> chevron is redrawn
  // in the charcoal ink with a 36px right gutter (appearance: none).
  field: {
    style: "outline",
    fillBg: genetecColor.white, // #ffffff
    underlineColor: genetecColor.grey.light, // #c2c8cf (unused for outline, kept for completeness)
    underlineWidth: "1px",
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2322282f' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.25rem"
  },
  // Genetec cards: white surface, mildly rounded (8px), a soft grey border and a
  // faint eggshell hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: genetecColor.grey.eggshell // #f0f0f0 faint eggshell hover
  },
  // Genetec secondary button = a faint eggshell fill with charcoal ink, darkening
  // on hover.
  buttonSecondary: {
    background: genetecColor.grey.eggshell, // #f0f0f0 faint eggshell fill
    border: genetecColor.grey.light, // #c2c8cf subtle stroke
    hoverBackground: "#e2e5e9" // #e2e5e9 darker grey on hover (à confirmer)
  },
  // Genetec tabs / sub-nav: active tab = cyan label with a cyan bottom indicator
  // (the brand accent bar), transparent fill.
  tabs: {
    activeText: genetecColor.cyan[500], // #00aeef active label (brand cyan)
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom", // cyan underline on the bottom edge
    indicatorMode: "border" // a real bottom border indicator
  },
  // Genetec pagination: borderless cyan link text; active page = filled charcoal
  // pill (the brand ink) with eggshell text.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: genetecColor.cyan[500], // #00aeef link text
    activeBackground: genetecColor.charcoal[1], // #22282f filled active page (charcoal)
    activeText: genetecColor.grey.eggshell, // #f0f0f0 eggshell on charcoal
    activeBorderWidth: "0",
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    minSize: "2.5rem", // 40px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Genetec breadcrumb: cyan links, muted trail, charcoal current page, muted
  // separators.
  breadcrumb: {
    linkText: genetecColor.cyan[500], // #00aeef
    text: genetecColor.grey.border, // #898c8f trail text
    currentText: genetecColor.charcoal[1], // #22282f current page (charcoal)
    separator: genetecColor.grey.border, // #898c8f
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    currentWeight: "600" // current page is emphasised
  },
  // Genetec notice / alert: a tinted box with a coloured left filet matching the
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
  // Genetec accordion / disclosure: a semibold charcoal summary trigger, mildly
  // rounded, grey-separated.
  accordion: {
    text: genetecColor.charcoal[1], // #22282f summary label (charcoal)
    paddingBlock: "1rem", // 16px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600", // semibold triggers
    lineHeight: "1.5rem" // 24px
  },
  // Genetec tag: a small chip with a faint eggshell fill and charcoal ink.
  tag: {
    radius: "4px", // square-ish chips (4px control radius)
    paddingBlock: "0.125rem", // 2px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    minHeight: "1.5rem", // 24px
    neutralBackground: genetecColor.grey.eggshell, // #f0f0f0 faint eggshell fill
    neutralText: genetecColor.charcoal[1] // #22282f charcoal
  },
  // Genetec badge: a small filled badge — cyan fill / charcoal text (the
  // measured secondary.contrastText is #22282f on cyan).
  badge: {
    radius: "4px", // 4px control radius
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.75rem", // 12px
    fontWeight: "600",
    lineHeight: "1.25rem", // 20px
    textTransform: "none",
    minHeight: "1.25rem", // 20px
    infoBackground: genetecColor.cyan[500], // #00aeef brand cyan
    infoText: genetecColor.charcoal[1] // #22282f charcoal on cyan (measured contrastText)
  },
  // Genetec checkbox/radio label: regular charcoal type at base size.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: genetecColor.charcoal[1] // #22282f charcoal
  },
  // Genetec search input: a boxed grey-stroked field, base type.
  search: {
    paddingBlock: "0.625rem", // 10px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Genetec toggle / switch label: regular charcoal type.
  toggle: {
    trackPadding: "0.125rem",
    lineHeight: "1.5rem", // 24px
    textColor: genetecColor.charcoal[1] // #22282f charcoal
  }
} as const;

// --- semantic (GENETEC-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: genetecColor.white, // #ffffff white
    subtle: genetecColor.grey.eggshell, // #f0f0f0 page eggshell
    raised: genetecColor.white, // #ffffff white
    inverse: genetecColor.charcoal[1], // #22282f charcoal reversed surface
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop
  },
  text: {
    primary: genetecColor.charcoal[1], // #22282f charcoal (primary text + headings)
    secondary: genetecColor.charcoal[2], // #363c43 secondary text (charcoal light)
    muted: genetecColor.grey.border, // #898c8f muted text
    inverse: genetecColor.grey.eggshell, // #f0f0f0 eggshell on dark surfaces (measured contrastText)
    link: genetecColor.cyan[500] // #00aeef electric cyan link
  },
  border: {
    subtle: genetecColor.grey.light, // #c2c8cf divider / input stroke
    strong: genetecColor.grey.medium, // #3e464f strong border (mediumBorder)
    interactive: genetecColor.cyan[500] // #00aeef brand cyan (interactive accent)
  },
  action: {
    primary: genetecColor.charcoal[1], // #22282f THE Genetec charcoal CTA
    primaryHover: genetecColor.charcoal[3], // #0e141b deepest charcoal hover/active
    primaryText: genetecColor.grey.eggshell, // #f0f0f0 eggshell text on charcoal (measured contrastText)
    secondary: genetecColor.grey.eggshell, // #f0f0f0 faint eggshell secondary surface
    secondaryHover: "#e2e5e9", // #e2e5e9 faint grey hover (à confirmer)
    secondaryText: genetecColor.charcoal[1], // #22282f charcoal secondary label
    danger: genetecColor.system.error // #d32f2f danger (à confirmer)
  },
  feedback: {
    success: genetecColor.system.success, // #15d08d
    warning: genetecColor.system.warning, // #b26a00
    error: genetecColor.system.error, // #d32f2f
    info: genetecColor.system.info // #00aeef
  },
  status: {
    pending: genetecColor.system.warning, // #b26a00
    processing: genetecColor.system.info, // #00aeef
    completed: genetecColor.system.success, // #15d08d
    failed: genetecColor.system.error // #d32f2f
  },
  // Categorical data-vis palette. Genetec does not publish a single categorical
  // token list; the eight categories below are assembled from the measured brand
  // hexes (cyan lead, deep cyan, charcoal family, success green, amber, greys) to
  // give a legible brand-true scale. See MAPPING.md, "à confirmer".
  data: {
    category1: genetecColor.cyan[500], // #00aeef electric cyan
    category2: genetecColor.cyan[700], // #007fbc deep cyan
    category3: genetecColor.charcoal[1], // #22282f charcoal
    category4: genetecColor.system.success, // #15d08d brand green
    category5: genetecColor.charcoal[2], // #363c43 charcoal light
    category6: genetecColor.grey.border, // #898c8f muted grey
    category7: genetecColor.cyan[400], // #3dc1f3 cyan light
    category8: genetecColor.system.warning // #b26a00 amber
  }
} as const;

/**
 * The GENETEC theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Genetec-specific (charcoal-and-cyan
 * physical-security) values, and the `component` layer is REBUILT from this
 * theme's own semantic/foundation via `createComponent` — so Genetec's charcoal
 * CTA, cyan accent, eggshell surfaces, boxed fields and cyan focus reach the
 * components (buttons, tabs, pagination, chat bubbles…), not just the elements
 * that read semantic vars directly.
 */
export const genetecTheme: TenantTheme = {
  id: "genetec",
  label: "Genetec",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default genetecTheme;
