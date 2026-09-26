import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Christian Dior SE brand theme for the Sentropic token structure.
 *
 * Christian Dior SE is the holding company; its financial site
 * (dior-finance.com) is sober and typographic: a deep navy brand colour
 * (`--brand-color`), a monochrome grey ramp, square corners, EB Garamond
 * display type paired with Montserrat. This package is a MEASURED-CLONE
 * mapping: every promoted hex is read from the public brand stylesheet and
 * carries a `//` comment citing its real source declaration; only font
 * *names* are referenced — never font binaries. Sources, counts (with their
 * convention) and exact provenance are documented in MAPPING.md. Where the
 * brand publishes no equivalent for a Sentropic role (status hues, modal
 * backdrop, large control geometry), the closest derived value is used and
 * the choice is noted "à confirmer" in MAPPING.md.
 *
 * Christian Dior SE colour reference (light theme — literal occurrences in
 * the brand region, short/long forms unified, comments excluded):
 *   White (surface default)           #ffffff   (19: 15 `#ffffff` + 4 `#fff`)
 *   Page grey (body background)       #eeeeee   (18: 16 `#eeeeee` + 2 `#eee`)
 *   Title / link dark grey            #393939   (15)
 *   Body text grey                    #666666   (14)
 *   Pale border grey                  #d6d6d6   (10)
 *   Navbar dark grey                  #313131   (8)
 *   Input border (vendor default)     #cccccc   (4, retained — not promoted)
 *   Near-black (footer)               #000000   (4: 3 `#000000` + 1 `#000`)
 *   Table alt-row grey                #e0e0e0   (2)
 *   Alt-row tint                      #efefef   (2)
 *   Dropdown divider grey             #c4c4c4   (2)
 *   Muted text grey                   #707070   (2)
 *   Vendor link grey                  #333333   (2 `#333`, retained — not promoted)
 *   Widget title tint                 #f5f5f5   (1)
 *   Divider grey                      #c7c7c7   (1)
 *   Mobile divider grey               #9c9c9c   (1)
 *   Navbar dropdown grey (vendor)     #777777   (1 `#777`, retained — not promoted)
 *   Brand navy (action)               #013755   (`--brand-color`, 1 declaration + 3 `var()`)
 */

// --- Christian Dior SE raw colour palette -----------------------------------
const diorColor = {
  // Brand navy — the single brand hue. Declared once as `--brand-color`
  // (style.css:2) and consumed 3 times through `var()` (style.css:6,10,11:
  // `.navbar` background, `.btn-primary` background + border).
  brand: {
    primary: "#013755", // --brand-color (navbar + primary-button family)
    hover: "#012a44", // derived darker navy for hover (à confirmer)
    light: "#e8eef2" // derived light navy tint for low-emphasis surfaces (à confirmer)
  },
  // Monochrome grey ramp, all measured in the brand region of style.css.
  grey: {
    0: "#ffffff", // surface default (19 unified occurrences)
    50: "#eeeeee", // body/page background (18 unified occurrences)
    100: "#f5f5f5", // overridden widget-title background step (style.css, 1 occurrence; winner is 8-digit, counted apart)
    200: "#e0e0e0", // table alt-row tint (style.css, 2 occurrences; third match in a /* */ block)
    300: "#efefef", // table alt-column tint (style.css, 2 occurrences)
    400: "#d6d6d6", // measured border grey, e.g. `#img-rapport-publication{border:1px solid #D6D6D6}` (10 occurrences)
    500: "#c4c4c4", // dropdown-item divider grey (style.css, 2 occurrences)
    600: "#707070", // publication figures grey (style.css, 2 occurrences)
    700: "#666666", // body text grey (style.css, 14 occurrences)
    800: "#393939", // title/link dark grey (style.css, 15 occurrences)
    900: "#313131", // navbar background (style.css, 8 occurrences)
    950: "#000000" // footer background (style.css, 4 unified occurrences)
  },
  // System / status colours. The brand publishes no status hue (no
  // success/warning/error rule in style.css), so the four hues are derived
  // stand-ins chosen to clear WCAG AA on white (à confirmer).
  system: {
    success: "#1e7e34", // derived legible green (5.14:1 on white)
    error: "#b3261e", // derived error red (6.54:1 on white)
    warning: "#8a4b00", // derived dark amber (6.80:1 on white)
    info: "#013755" // brand navy in the info role (12.51:1 on white)
  }
} as const;

// --- foundation (Christian-Dior-specific values) -----------------------------
const foundation = {
  color: {
    // The brand's colour of action is the deep navy, not a blue tint scale.
    blue: {
      10: diorColor.brand.light, // #e8eef2 lightest navy tint (à confirmer)
      60: diorColor.brand.primary, // #013755 brand navy
      80: diorColor.brand.hover // #012a44 darker interactive navy (à confirmer)
    },
    // The brand publishes no accent hue (monochrome + navy), so the Sentropic
    // "cyan" accent slot carries measured neutrals (à confirmer).
    cyan: {
      10: diorColor.grey[100], // #f5f5f5 light neutral tint
      50: diorColor.grey[600], // #707070 mid neutral accent
      70: diorColor.grey[800] // #393939 deep neutral accent
    },
    // Sentropic "slate" role family mapped onto the measured grey ramp.
    slate: {
      0: diorColor.grey[0], // white
      10: diorColor.grey[50], // page background
      20: diorColor.grey[200], // alt-row tint
      60: diorColor.grey[700], // body text
      80: diorColor.grey[800], // title text
      90: diorColor.grey[900] // navbar dark
    },
    feedback: {
      success: diorColor.system.success,
      warning: diorColor.system.warning,
      error: diorColor.system.error,
      info: diorColor.system.info
    }
  },
  // Christian Dior SE ships Montserrat for UI/buttons/tables and EB Garamond
  // for display/headings (both declared in style.css `font` shorthands and
  // linked from the homepage head). We reference the font *names* only.
  font: {
    sans: "'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'EB Garamond', Georgia, 'Times New Roman', serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; the brand authors its lengths in px).
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
  // Christian Dior SE aesthetic is square: the brand zeroes vendor radii
  // (`.jumbotron{border-radius:0 !important}`, `button…dropdown-toggle{border-radius:0}`,
  // `a.lang-change{border-radius:0 !important}`, `border-radius:unset` on
  // `#publication-grids` and `.dropdown-menu`).
  radius: {
    none: "0",
    sm: "0", // square controls (measured pattern)
    md: "0", // square buttons / inputs / tabs (measured pattern)
    lg: "0", // square cards / grids (measured `#publication-grids` unset)
    pill: "999px" // structural pill default (à confirmer)
  },
  // The brand explicitly removes vendor shadows
  // (`.dropdown-menu{box-shadow:unset}`, twice); deeper elevation is not
  // published, so medium/floating stay neutral (à confirmer).
  shadow: {
    subtle: "none", // measured shadow removal on menus
    medium: "0 4px 12px rgb(0 0 0 / 0.14)", // (à confirmer)
    floating: "0 8px 24px rgb(0 0 0 / 0.18)" // (à confirmer)
  },
  // Menu animation publishes `.5s ease-out` (desktop `.dropdown-menu`) and
  // `transform 1s` (`.expand-arrow`); fast has no brand value (à confirmer).
  motion: {
    fast: "150ms", // (à confirmer)
    normal: "500ms", // `.dropdown-menu{transition:all .5s ease-out}`
    slow: "1s", // `.expand-arrow{transition:transform 1s}`
    easing: "ease-out" // measured menu easing
  },
  // z-index roles are not brand-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Christian Dior SE) -------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field / image / table borders are 1px
    thick: "2px" // dropdown-item dividers are 2px (`#a-dropdown-item{border-bottom:2px solid #c4c4c4}`)
  },
  borderStyle: { solid: "solid" },
  // Control density transcribed from brand px at the 16px theme root. md from
  // `.cmsPage input{height:45px}` (2.8125rem); sm from `input#s{height:25px}`
  // (1.5625rem) with the 4px/15px select paddings
  // (`#annee-select-button`, `select.filterExercice`); lg unpublished (à confirmer).
  density: {
    sm: { controlHeight: "1.5625rem", paddingBlock: "0.25rem", paddingInline: "0.9375rem", gap: "0.5rem", minWidth: "1.5625rem", fontSize: "1rem" },
    md: { controlHeight: "2.8125rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "2.8125rem", fontSize: "1.0625rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0.625rem", paddingInline: "1.25rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // Dior typography: Montserrat for controls/labels (buttons, selects),
  // Montserrat labels, links underlined. Brand buttons are uppercase with
  // normal weight (`#p-button-slider{font:…17px/24px Montserrat}`, uppercase).
  typography: {
    control: { family: "'Montserrat', system-ui, sans-serif", size: "1.0625rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "uppercase", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Montserrat', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Montserrat', system-ui, sans-serif", size: "1.125rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Content links are the title dark grey `#393939`
    // (`#gouvernance-page-widget-content-div a`, `a.fxd-link`), underlined at
    // rest (`a.fxd-link{text-decoration:underline}`, `a.link-ar{…underline !important}`).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.55", // Sentropic base value (à confirmer)
  transition: { property: "all", duration: "500ms", easing: "ease-out" }, // measured menu transition
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS: the brand publishes no focus technique (no `outline` / `:focus-visible`
  // rule in style.css — only background resets on `.navbar-toggle:focus` and
  // `.open>a:focus`), so the strategy stays the browser-default outline and the
  // colour is routed to the measured brand navy (12.51:1 on white, à confirmer).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: diorColor.brand.primary, // #013755 brand navy
    inset: "0"
  },
  // Form fields are BOXED (outline): no fill published (transparent over the
  // page), 1px stroke. The brand's own stroke (`#ccc` on `.cmsPage input`) is
  // the Bootstrap vendor default retained, so the builder draws from the
  // measured border grey `#d6d6d6` instead. `style: "outline"` makes the
  // builder draw four equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: diorColor.grey[0], // #ffffff
    underlineColor: diorColor.grey[400], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the brand navy with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23013755' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: square white grids (`#publication-grids` white, radius unset).
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: diorColor.grey[50] // #eeeeee page tint
  },
  // Secondary button = light button: transparent fill, dark-grey stroke,
  // page-tint hover (derived composition of measured values — à confirmer).
  buttonSecondary: {
    background: "transparent",
    border: diorColor.grey[800], // #393939 stroke
    hoverBackground: diorColor.grey[50] // #eeeeee hover fill
  },
  // Top-nav: white uppercase EB Garamond links on the dark navbar
  // (`#ul-my-navbar>li>a{color:#FFFFFF}` over `#my-navbar{background:#313131}`);
  // the active tab carries the same white label (à confirmer).
  tabs: {
    activeText: diorColor.grey[0], // #ffffff nav label
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
  // Pagination unpublished: dark-grey links, navy filled active page with
  // white text (measured `.btn-primary` pairing — à confirmer).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: diorColor.grey[800], // #393939 link text
    activeBackground: diorColor.brand.primary, // #013755 filled active page
    activeText: diorColor.grey[0], // white on navy
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb transcribed from the fil d'Ariane
  // (`#gouvernance-page-fil-dariane-text{font:…200 16px/19px Montserrat;color:#666666}`,
  // links `color:unset` = inherited grey; titles `#393939`).
  breadcrumb: {
    linkText: diorColor.grey[700], // #666666 inherited link grey
    text: diorColor.grey[700], // #666666 trail text
    currentText: diorColor.grey[800], // #393939 current page
    separator: diorColor.grey[700], // #666666
    fontSize: "1rem", // 16px
    lineHeight: "1.1875rem", // 19px
    currentWeight: "400"
  },
  // Alert / notice: no alert component published; transparent box with a navy
  // left filet (derived — à confirmer).
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
  // Accordion transcribed from the governance widgets
  // (`#gouvernance-page-widget-title-div{padding:20px}` + `>h2{font:…300 40px/49px Montserrat;color:#666666}`,
  // `.expand-arrow` trigger).
  accordion: {
    text: diorColor.grey[700], // #666666 widget title
    paddingBlock: "1.25rem", // 20px
    paddingInline: "1.25rem", // 20px
    fontSize: "2.5rem", // 40px
    fontWeight: "300",
    lineHeight: "3.0625rem" // 49px
  },
  // Tag: no chip published; square page-tint chip (derived — à confirmer).
  tag: {
    radius: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: diorColor.grey[50], // #eeeeee
    neutralText: diorColor.grey[800] // #393939
  },
  // Badge: square badge in the brand navy with white text (measured
  // `.btn-primary` pairing — à confirmer).
  badge: {
    radius: "0",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: diorColor.brand.primary, // #013755
    infoText: diorColor.grey[0] // white
  },
  // Choice label transcribed from `#annee-label{font:…18px/24px Montserrat;color:#666666}`.
  choice: {
    labelFontSize: "1.125rem", // 18px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: diorColor.grey[700] // #666666 label text
  },
  // Search input (`input#s{height:25px}` — geometry in density.sm; à confirmer).
  search: {
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Toggle / switch label (à confirmer).
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: diorColor.grey[800] // #393939
  }
} as const;

// --- semantic (Christian-Dior-specific role mapping) --------------------------
const semantic = {
  surface: {
    default: diorColor.grey[0], // white (`body` surfaces, `#jumbotron-logo`)
    subtle: diorColor.grey[50], // #eeeeee page background (`body{background:#eee}`)
    raised: diorColor.grey[0], // white
    inverse: diorColor.grey[900], // #313131 dark navbar (`#my-navbar`)
    overlay: "rgb(0 0 0 / 0.6)" // modal backdrop (à confirmer — no backdrop published)
  },
  text: {
    primary: diorColor.grey[800], // #393939 titles (11.55:1 on white)
    secondary: diorColor.grey[700], // #666666 body text (5.74:1 on white)
    muted: diorColor.grey[600], // #707070 publication figures (4.95:1 on white)
    inverse: diorColor.grey[0], // white on dark / navy surfaces
    link: diorColor.grey[800] // #393939 content links (11.55:1 on white)
  },
  border: {
    subtle: diorColor.grey[400], // #d6d6d6 measured border (image frame)
    strong: diorColor.grey[500], // #c4c4c4 dropdown dividers
    interactive: diorColor.brand.primary // #013755 `.btn-primary` border (12.51:1 on white)
  },
  action: {
    primary: diorColor.brand.primary, // #013755 `.btn-primary` background
    primaryHover: diorColor.brand.hover, // #012a44 darker navy (à confirmer)
    primaryText: diorColor.grey[0], // white on navy (12.51:1)
    secondary: diorColor.grey[50], // #eeeeee secondary surface
    secondaryHover: diorColor.grey[200], // #e0e0e0 alt-row tint
    secondaryText: diorColor.grey[800], // #393939 on grey (9.95:1)
    danger: diorColor.system.error // #b3261e derived error red (à confirmer)
  },
  feedback: {
    success: diorColor.system.success,
    warning: diorColor.system.warning,
    error: diorColor.system.error,
    info: diorColor.system.info
  },
  status: {
    pending: diorColor.system.warning,
    processing: diorColor.system.info,
    completed: diorColor.system.success,
    failed: diorColor.system.error
  },
  // Categorical data-vis palette built from the brand hues. The brand publishes
  // no chart scale, so this is a coherent proposal drawn from the navy +
  // monochrome ramp plus the derived status hues (see MAPPING.md, "à confirmer").
  data: {
    category1: diorColor.brand.primary, // #013755 brand navy
    category2: diorColor.grey[900], // #313131 dark grey
    category3: diorColor.system.success, // green
    category4: diorColor.system.warning, // amber
    category5: diorColor.system.error, // red
    category6: diorColor.system.info, // navy info
    category7: diorColor.grey[700], // #666666 grey
    category8: diorColor.grey[400] // #d6d6d6 pale grey
  }
} as const;

/**
 * The Christian Dior SE theme as a Sentropic `TenantTheme`. The `tokens` tree
 * is complete: `foundation` and `semantic` carry Dior-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the navy brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const christianDiorTheme: TenantTheme = {
  id: "christian-dior",
  label: "Christian Dior",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default christianDiorTheme;
