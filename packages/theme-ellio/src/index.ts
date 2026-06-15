import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * ELLIO brand theme for the Sentropic token structure.
 *
 * ELLIO (ellio.ca / en.ellio.ca) is a Montréal / Québec sustainable-development
 * consultancy and certified B Corp. The site is built on Webflow; all values
 * below are MEASURED from the public published CSS bundle
 * (cdn.prod.website-files.com/.../ellio-lite.webflow.shared.css), notably its
 * `:root` design tokens. We only reference the font *name* (Exo, served from
 * Google Fonts) here, never font binaries. Sources are documented in MAPPING.md.
 * Where ELLIO has no direct equivalent for a Sentropic role, the closest
 * measured value is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * ELLIO colour reference (measured `:root` custom properties + base rules):
 *   Ellio blue (brand / action / link / h1·h3)  #194f90  (--ellio_blue)
 *   Ellio green (accent / hover / h2, B Corp)    #00c08b  (--ellio_vert)
 *   Grey (secondary text / authors)              #464444  (--grey)
 *   Grey light-2 (muted / field underline)       #959595  (--grey-light-2)
 *   Grey 3 (subtle borders)                      #bdb9b9  (--grey_3)
 *   Grey light (subtle surface)                  #f1f1f1  (--grey-light)
 *   White (surface default)                      #ffffff  (--white)
 *   Body text ink                                #333333  (body { color: #333 })
 *   Error red                                    #ea384c  (.w-file-upload-error-msg)
 *   Data-vis ramp (legend circles, measured):
 *     #194f90 #006fa8 #318cbf #57c0e0 #64beba #00a8a6 #0ca783 #00c08b
 */

// --- ELLIO raw colour palette (measured from the published CSS) ------------
const ellioColor = {
  // Ellio blue — the brand / action / link family (`--ellio_blue`).
  blue: {
    main: "#194f90", // --ellio_blue (brand: links, nav, h1/h3, primary button .button-service.dark)
    mid: "#006fa8", // data-vis ramp _2 (.cercle_color_leg._2)
    light2: "#318cbf", // data-vis ramp _3 (.cercle_color_leg._3)
    sky: "#57c0e0", // data-vis ramp _4 (.cercle_color_leg._4)
    tint: "#e3edf6" // light blue tint for low-emphasis surfaces (derived — à confirmer)
  },
  // Ellio green / teal — sustainability accent (`--ellio_vert`) + ramp tail.
  green: {
    main: "#00c08b", // --ellio_vert (accent: h2, link hover, B Corp green)
    deep: "#0ca783", // data-vis ramp _7 (.cercle_color_leg._7) — darker green for hover/active
    teal: "#00a8a6", // data-vis ramp _6 (.cercle_color_leg._6)
    sea: "#64beba", // data-vis ramp _5 (.cercle_color_leg._5)
    tint: "#e0f6ee" // light green tint for low-emphasis surfaces (derived — à confirmer)
  },
  // Neutral greys (measured `:root` vars + base body/heading rules).
  grey: {
    0: "#ffffff", // --white (surface default)
    50: "#fafafa", // very light surface alt (measured in section backgrounds)
    100: "#f1f1f1", // --grey-light (subtle surface)
    300: "#bdb9b9", // --grey_3 (subtle border)
    500: "#959595", // --grey-light-2 (muted text / field underline)
    700: "#464444", // --grey (secondary text)
    800: "#333333", // body ink (body { color: #333 })
    900: "#262926" // near-black (.cookie-modal_button:hover)
  },
  // System / status colours. ELLIO publishes the error red; success/warning/info
  // are drawn from the brand green/blue ramp, darkened for WCAG AA on white
  // where needed (à confirmer).
  system: {
    success: "#0ca783", // brand deep green (AA on white) — derived from ramp _7
    error: "#ea384c", // .w-file-upload-error-msg (measured error red)
    warning: "#b35900", // amber, darkened for AA on white (à confirmer)
    info: "#194f90" // ellio blue (info notice)
  }
} as const;

// --- foundation (ELLIO-specific values) ------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the Ellio brand blue.
    blue: {
      10: ellioColor.blue.tint, // lightest blue tint (derived)
      60: ellioColor.blue.main, // #194f90 brand blue (primary)
      80: "#123a6c" // darker blue for hover/active (derived — à confirmer)
    },
    // ELLIO has no cyan; the Sentropic "cyan" accent slot is mapped to the
    // sustainability GREEN family (the brand's second signature colour).
    cyan: {
      10: ellioColor.green.tint, // light green tint (derived)
      50: ellioColor.green.main, // #00c08b Ellio green accent
      70: ellioColor.green.deep // #0ca783 darker green
    },
    // Sentropic "slate" role family mapped onto the ELLIO grey scale.
    slate: {
      0: ellioColor.grey[0], // white
      10: ellioColor.grey[100], // #f1f1f1 subtle surface
      20: ellioColor.grey[300], // #bdb9b9 subtle borders
      60: ellioColor.grey[700], // #464444 secondary text
      80: ellioColor.grey[800], // #333333 primary ink
      90: ellioColor.grey[900] // #262926 near-black
    },
    feedback: {
      success: ellioColor.system.success,
      warning: ellioColor.system.warning,
      error: ellioColor.system.error,
      info: ellioColor.system.info
    }
  },
  // ELLIO ships "Exo" for everything (47 declarations in the bundle), served
  // from Google Fonts. Body falls back to Arial. We reference the font *name*
  // only, not the binaries. No distinct monospace is published (à confirmer).
  font: {
    sans: "'Exo', Arial, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Exo', Arial, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; ELLIO's Webflow stack uses a comparable scale).
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
  // ELLIO's signature is the ASYMMETRIC corner (rounded top-right + bottom-left,
  // e.g. .button-service.dark uses 10px; cards/circles 12–15px). We keep the
  // scalar radius modest (controls lightly rounded), pills fully round.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px (.cookie-modal radius .25rem)
    md: "0.375rem", // 6px — button / input (.375rem appears in the bundle)
    lg: "0.625rem", // 10px — cards (matches the 10px Ellio corner)
    pill: "100px" // tags / pills (border-radius: 100px in the bundle)
  },
  // Light, neutral elevation. Exact specs not tokenised by ELLIO (à confirmer).
  shadow: {
    subtle: "0 1px 2px rgb(38 41 38 / 0.10)",
    medium: "0 4px 12px rgb(38 41 38 / 0.14)",
    floating: "0 8px 24px rgb(38 41 38 / 0.18)"
  },
  // Motion durations are not tokenised by ELLIO publicly; kept aligned with the
  // Sentropic base ("à confirmer").
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // z-index roles are not ELLIO-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (ELLIO) ------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // ELLIO control density. Webflow base inputs are 38px tall; buttons carry
  // generous uppercase padding. md targets ~44px for touch comfort.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // ELLIO typography: Exo everywhere; buttons/headings are UPPERCASE (measured:
  // h1/h2 + .button-service set text-transform: uppercase, weights 500–700).
  typography: {
    control: { family: "'Exo', Arial, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.4", letterSpacing: "0.02em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Exo', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Exo', Arial, sans-serif", size: "0.875rem", weight: "700", lineHeight: "1.4", letterSpacing: "0.02em", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // ELLIO links are not underlined by default (a { text-decoration: none });
    // they shift from brand blue to brand green on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "0.08em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.5", // ELLIO dims disabled controls (.bouton_blog opacity: .5)
  transition: { property: "background-color, border-color, color, outline-color", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // ELLIO FOCUS: the live Webflow stack relies on the browser/Webflow default
  // (inputs go outline:0, border → generic blue). We encode a brand-blue
  // OUTLINE focus for accessibility parity (technique à confirmer).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: ellioColor.blue.main, // #194f90 brand blue focus
    inset: "0"
  },
  // ELLIO form fields are BOXED (outline): white fill, 1px grey border, modest
  // radius (Webflow base .w-input/.w-select: bg #fff, border 1px solid #ccc,
  // 38px). `style: "outline"` draws four equal borders from surface.default +
  // border.subtle.
  field: {
    style: "outline",
    fillBg: ellioColor.grey[0], // #ffffff
    underlineColor: ellioColor.grey[500], // #959595 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Ellio blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23194f90' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // ELLIO cards: a 1px grey border + the signature soft corner, subtle hover.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: ellioColor.grey[100] // #f1f1f1
  },
  // ELLIO secondary button = the light chip (.button-service): blue uppercase
  // text on a light grey fill, turning green on hover (.button-service:hover).
  buttonSecondary: {
    background: ellioColor.grey[100], // #f1f1f1 light fill
    border: ellioColor.grey[100], // borderless chip
    hoverBackground: ellioColor.green.main // #00c08b green on hover
  },
  // ELLIO tabs / blog navigation: active label in brand blue, bold, with a
  // bottom accent (the green/blue gradient signature). Underline on the bottom.
  tabs: {
    activeText: ellioColor.blue.main, // #194f90
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "0.875rem", // 14px (.nav-link-ellio is 14px)
    lineHeight: "1.4rem",
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // ELLIO pagination: borderless blue text links; active page = filled blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: ellioColor.blue.main, // #194f90 link text
    activeBackground: ellioColor.blue.main, // #194f90 filled active page
    activeText: ellioColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "0.875rem", // 14px
    lineHeight: "1.4rem"
  },
  // ELLIO breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: ellioColor.blue.main, // #194f90
    text: ellioColor.grey[700], // #464444 trail text
    currentText: ellioColor.grey[800], // #333333 current page
    separator: ellioColor.grey[500], // #959595
    fontSize: "0.875rem", // 14px
    lineHeight: "1.4rem",
    currentWeight: "700"
  },
  // ELLIO notice / alert: a coloured LEFT accent filet (the blog intro uses
  // border-left: 1px solid #00c08b) on a transparent box.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar (green)
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // ELLIO accordion / details: a brand-blue bold summary trigger.
  accordion: {
    text: ellioColor.blue.main, // #194f90 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600",
    lineHeight: "1.5rem" // 24px
  },
  // ELLIO tag: a pill chip (.link_categorie uses border-radius: 20px, uppercase).
  tag: {
    radius: "100px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.625rem", // 10px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1.4rem",
    minHeight: "1.5rem", // 24px
    neutralBackground: ellioColor.grey[100], // #f1f1f1
    neutralText: ellioColor.grey[700] // #464444
  },
  // ELLIO badge: a pill filled badge in the brand blue.
  badge: {
    radius: "100px",
    paddingBlock: "0",
    paddingInline: "0.625rem", // 10px
    fontSize: "0.75rem", // 12px
    fontWeight: "700",
    lineHeight: "1.4rem",
    textTransform: "uppercase",
    minHeight: "1.5rem", // 24px
    infoBackground: ellioColor.blue.main, // #194f90
    infoText: ellioColor.grey[0] // white
  },
  // ELLIO checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: ellioColor.grey[800] // #333333
  },
  // ELLIO search input (.search-input carries the asymmetric soft corner).
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // ELLIO toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: ellioColor.grey[800] // #333333
  }
} as const;

// --- semantic (ELLIO-specific role mapping) --------------------------------
const semantic = {
  surface: {
    default: ellioColor.grey[0], // white
    subtle: ellioColor.grey[100], // #f1f1f1 background alt
    raised: ellioColor.grey[0], // white
    inverse: ellioColor.blue.main, // #194f90 brand-blue inverse surface (header/footer)
    overlay: "rgb(25 79 144 / 0.6)" // modal backdrop (Ellio blue tint)
  },
  text: {
    primary: ellioColor.grey[800], // #333333 body ink
    secondary: ellioColor.grey[700], // #464444 (--grey)
    muted: ellioColor.grey[500], // #959595 (--grey-light-2)
    inverse: ellioColor.grey[0], // white on dark / coloured surfaces
    link: ellioColor.blue.main // #194f90 (--ellio_blue / a)
  },
  border: {
    subtle: ellioColor.grey[300], // #bdb9b9 (--grey_3)
    strong: ellioColor.grey[500], // #959595 (--grey-light-2)
    interactive: ellioColor.blue.main // #194f90 focus / interactive
  },
  action: {
    primary: ellioColor.blue.main, // #194f90 primary button (.button-service.dark)
    primaryHover: ellioColor.green.main, // #00c08b green hover (Ellio's signature blue→green)
    primaryText: ellioColor.grey[0], // white text on blue
    secondary: ellioColor.grey[100], // #f1f1f1 secondary surface
    secondaryHover: ellioColor.green.main, // #00c08b green on hover (.button-service:hover)
    secondaryText: ellioColor.blue.main, // #194f90
    danger: ellioColor.system.error // #ea384c
  },
  feedback: {
    success: ellioColor.system.success,
    warning: ellioColor.system.warning,
    error: ellioColor.system.error,
    info: ellioColor.system.info
  },
  status: {
    pending: ellioColor.system.warning,
    processing: ellioColor.system.info,
    completed: ellioColor.system.success,
    failed: ellioColor.system.error
  },
  // Categorical data-vis palette taken DIRECTLY from ELLIO's measured legend
  // circles (.cercle_color_leg._1.._7) plus the brand green tail — a coherent
  // blue → teal → green ramp that reads as "sustainability".
  data: {
    category1: ellioColor.blue.main, // #194f90 brand blue (_1)
    category2: ellioColor.blue.mid, // #006fa8 (_2)
    category3: ellioColor.blue.light2, // #318cbf (_3)
    category4: ellioColor.blue.sky, // #57c0e0 (_4)
    category5: ellioColor.green.sea, // #64beba (_5)
    category6: ellioColor.green.teal, // #00a8a6 (_6)
    category7: ellioColor.green.deep, // #0ca783 (_7)
    category8: ellioColor.green.main // #00c08b brand green tail
  }
} as const;

/**
 * The ELLIO theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry ELLIO-specific measured values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the ELLIO brand reaches every component (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const ellioTheme: TenantTheme = {
  id: "ellio",
  label: "Ellio",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default ellioTheme;
