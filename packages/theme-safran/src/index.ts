import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Safran brand theme for the Sentropic token structure.
 *
 * All values below are MEASURED from Safran's PUBLIC live theme stylesheet
 * (`themes/custom/safran_fo/public/css/main.css`, ~1.3 MB) and the official logo
 * SVGs, captured from safran-group.com (Wayback snapshot 2026-06-17 — the live
 * origin sits behind Cloudflare). We only reference font *names* (Barlow) here,
 * never font binaries. Sources and exact provenance are in MAPPING.md. Values
 * Safran does not publish as exact tokens (light tints, sm/lg densities, shadow
 * specs) are derived and flagged "à confirmer" in MAPPING.md.
 *
 * IMPORTANT — anchors vs live. Third-party aggregators quote Safran's blue as
 * "Curious Blue" #1999D4 / #3A9FD6 and its grey as "Comet" #4F5468 / #51546A;
 * these CONTRADICT the live CSS and are NOT used. The measured live blue is
 * #3B87CC (260 occurrences) and the measured grey is #525668 (body text + the
 * logo wordmark `.st0` fill).
 *
 * Contrast decision (WCAG). The live action/link blue #3B87CC scores only
 * 3.80:1 on white → it fails AA for normal text (it passes UI/large text ≥3:1).
 * Safran's own CTA is a gradient `45deg #073A7C → #1767AD → #3B87CC`; its
 * mid-stop #1767AD scores 5.87:1 → AA. We therefore wire the interactive roles
 * (primary action, links, interactive borders) to the on-brand AA blue #1767AD,
 * and park the brighter #3B87CC in the accent (`cyan`) slot + focus + data-vis,
 * mirroring how the brand's lighter blue is used decoratively.
 *
 * Safran colour reference (light theme, measured):
 *   White (background default)         #ffffff   (surface default)
 *   Off-white (background alt)         #F9FAFC   (measured, 65×)
 *   Field / input border               #BCBFCF   (measured: input border)
 *   Mid grey-blue (muted / 2ndary btn) #84899F   (measured, 88×)
 *   Brand grey (secondary text)        #525668   (measured, 132× + logo wordmark)
 *   Near-black navy (primary text)     #1B1D27   (measured, 132×)
 *   Deep navy (dark sections/inverse)  #141D29   (measured: dark sections)
 *   Deepest navy                       #070E1D   (measured)
 *   Action blue (AA, gradient mid)     #1767AD   (measured CTA mid-stop — 5.87:1, AA)
 *   Bright brand blue (link/accent)    #3B87CC   (measured, 260× — 3.80:1, UI only)
 *   Deep blue (hover / gradient origin)#073A7C   (measured CTA origin)
 *   Light accent blue                  #7FB8E7   (measured, 43×)
 *   Logo gradient light stop           #9DCEEA   (measured: logo.svg)
 *   Logo gradient dark stop            #2257A1   (measured: logo.svg)
 *   Success green                      #32D970   (measured, 16×)
 *   Warning / error rust               #C6541C   (measured, 18× — warning AND error)
 *   Info blue                          #3B87CC   (info reuses the brand blue — derived)
 */

// --- Safran raw colour palette (measured from safran_fo/main.css) -----------
const safranColor = {
  // Interactive / brand blue family. The live CTA is a blue gradient
  // (#073A7C → #1767AD → #3B87CC); we expose its stops as discrete roles.
  blue: {
    bright: "#3B87CC", // measured (260×): live link/CTA blue, gradient top stop (3.80:1 on white — UI/accent only)
    action: "#1767AD", // measured: CTA gradient mid-stop — AA on white (5.87:1); interactive workhorse
    deep: "#073A7C", // measured: CTA gradient origin (deepest) — primary hover / deep
    light: "#7FB8E7", // measured (43×): light accent blue / lighter stop
    tint: "#e8f1fb", // derived very light blue tint for hover fills (à confirmer)
    logoLight: "#9DCEEA", // measured: logo.svg gradient light stop
    logoDark: "#2257A1" // measured: logo.svg gradient dark stop
  },
  // Neutral scale — measured cool greys/navies from the live theme.
  grey: {
    0: "#ffffff", // surface default / white
    50: "#F9FAFC", // measured (65×): off-white background alt
    200: "#BCBFCF", // measured: field / input border
    400: "#84899F", // measured (88×): mid grey-blue (muted text / secondary button fill)
    600: "#525668", // measured (132× + logo wordmark .st0): brand grey, secondary text
    800: "#1B1D27", // measured (132×): near-black navy, primary text
    900: "#141D29", // measured: deep navy (dark sections / inverse surface)
    950: "#070E1D" // measured: deepest navy
  },
  // System / status colours, measured from the live theme. Safran publishes no
  // dedicated error red: the rust #C6541C does double duty (warning AND error).
  system: {
    success: "#32D970", // measured (16×): success green
    warning: "#C6541C", // measured (18×): rust/orange — warning
    error: "#C6541C", // measured: same rust serves as error (no distinct red published)
    info: "#3B87CC" // info reuses the bright brand blue (derived)
  }
} as const;

// --- foundation (Safran-specific values) ------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family = Safran's INTERACTIVE blue (AA on white).
    blue: {
      10: safranColor.blue.tint, // lightest blue tint (à confirmer)
      60: safranColor.blue.action, // #1767AD action — AA workhorse
      80: safranColor.blue.deep // #073A7C deep / hover
    },
    // Sentropic "cyan" accent slot carries Safran's BRIGHT blue #3B87CC (the
    // most-used live blue, and the logo gradient) — decorative/accent, NOT the
    // AA interactive colour.
    cyan: {
      10: safranColor.blue.logoLight, // #9DCEEA logo light stop
      50: safranColor.blue.bright, // #3B87CC bright brand blue accent
      70: safranColor.blue.logoDark // #2257A1 logo dark stop
    },
    // Sentropic "slate" role family mapped onto the measured neutral scale.
    slate: {
      0: safranColor.grey[0], // white
      10: safranColor.grey[50], // #F9FAFC background alt
      20: safranColor.grey[200], // #BCBFCF subtle borders / field stroke
      60: safranColor.grey[600], // #525668 secondary text / brand grey
      80: safranColor.grey[800], // #1B1D27 primary text
      90: safranColor.grey[950] // #070E1D darkest
    },
    feedback: {
      success: safranColor.system.success,
      warning: safranColor.system.warning,
      error: safranColor.system.error,
      info: safranColor.system.info
    }
  },
  // Safran's live theme sets `font-family: 'Barlow', Arial, sans-serif` on html
  // and headings (200+ declarations). Barlow is the brand UI typeface (open
  // source / Google Fonts); display and body therefore both use Barlow. The
  // logo wordmark is a frozen vector (proprietary lettering), not a web font and
  // not referenced here. Mono = system stack. Font *names* only, no binaries.
  font: {
    sans: "'Barlow', Arial, Helvetica, sans-serif",
    display: "'Barlow', Arial, Helvetica, sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; Safran's theme uses a comparable scale).
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
  // Safran aesthetic is sharp/precise: inputs are SQUARE (border-radius:0,
  // measured), buttons carry a small 4px radius (measured .4rem at root 62.5%).
  // The global control radius is 4px (buttons/tabs); the field overrides to 0.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.25rem", // 4px — button / tabs (measured .4rem ≈ 4px); inputs override to 0
    lg: "0.25rem", // 4px — cards stay sharp (à confirmer)
    pill: "999px" // tags / pills
  },
  // Light elevation tinted with the brand navy. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(20 29 41 / 0.10)",
    medium: "0 4px 12px rgb(20 29 41 / 0.14)",
    floating: "0 8px 24px rgb(20 29 41 / 0.18)"
  },
  // Motion durations are not tokenised publicly; kept aligned with the
  // Sentropic base ("à confirmer").
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
  // --- Anatomy primitives (Safran) -----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border 1px (measured .1rem)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. ~40px medium controls; sm/lg follow the standard size
  // scale ("à confirmer" — Safran does not publish a density scale).
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // Safran typography: Barlow across controls / fields / labels and display
  // titles. Button labels use Barlow semibold (600), no transform.
  typography: {
    control: { family: "'Barlow', Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Barlow', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Barlow', Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Links recolour to the brand blue and underline on hover (measured
    // `a:hover{color:#3b87cc}`); we expose the AA action blue at rest.
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
  // FOCUS = a tight INSET ring in the bright brand blue #3B87CC. Safran's live
  // focus recolours the control's own border to #3B87CC (1px, no external glow);
  // an inset ring (offset 0) is the faithful token expression — the indicator
  // lives on the control edge, not as a floating outline. #3B87CC scores 3.80:1
  // on white (≥3:1 — valid as a non-text focus indicator).
  focus: {
    strategy: "inset",
    width: "2px",
    offset: "0",
    color: safranColor.blue.bright, // #3B87CC measured focus-border blue
    inset: "0"
  },
  // Form fields are BOXED (outline) and SQUARE: white fill, 1px #BCBFCF border,
  // radius 0 (measured `border:solid .1rem #BCBFCF; border-radius:0`). The field
  // overrides the global 4px control radius to keep crisp square corners.
  field: {
    style: "outline",
    fillBg: safranColor.grey[0], // #ffffff
    underlineColor: safranColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    radiusTop: "0", // square inputs (measured border-radius:0)
    radiusBottom: "0", // square inputs (measured border-radius:0)
    // Native <select>: redraw the chevron in the brand grey with a 40px gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23525668' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px border + small radius, light off-white hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: safranColor.grey[50] // #F9FAFC
  },
  // Secondary button = a SOLID mid grey-blue (measured `#84899F` fill, white
  // label), darkening to the brand grey on hover.
  buttonSecondary: {
    background: safranColor.grey[400], // #84899F solid grey fill
    border: safranColor.grey[400], // #84899F
    hoverBackground: safranColor.grey[600] // #525668 darker grey on hover
  },
  // Tabs / top-nav: active tab = bold blue label with a bottom blue underline.
  // Active text uses the AA action blue (#1767AD) so the label stays legible.
  tabs: {
    activeText: safranColor.blue.action, // #1767AD
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "600",
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: borderless blue links; active page = filled AA action blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: safranColor.blue.action, // #1767AD link text
    activeBackground: safranColor.blue.action, // #1767AD filled active page
    activeText: safranColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: safranColor.blue.action, // #1767AD
    text: safranColor.grey[600], // #525668 trail text
    currentText: safranColor.grey[800], // #1B1D27 current page
    separator: safranColor.grey[600], // #525668
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "600"
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
    text: safranColor.grey[800], // #1B1D27 summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "600",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: a small 4px-radius grey chip.
  tag: {
    radius: "4px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: safranColor.grey[50], // #F9FAFC
    neutralText: safranColor.grey[800] // #1B1D27
  },
  // Badge: a 4px-radius filled badge in the AA action blue.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "600",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: safranColor.blue.action, // #1767AD
    infoText: safranColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: safranColor.grey[800] // #1B1D27
  },
  // Search input.
  search: {
    paddingBlock: "0.375rem", // 6px
    paddingInline: "0.75rem", // 12px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: safranColor.grey[800] // #1B1D27
  }
} as const;

// --- semantic (Safran-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: safranColor.grey[0], // white
    subtle: safranColor.grey[50], // #F9FAFC background alt
    raised: safranColor.grey[0], // white
    inverse: safranColor.grey[900], // #141D29 deep navy inverse surface
    overlay: "rgb(20 29 41 / 0.6)" // modal backdrop (brand navy tint)
  },
  text: {
    primary: safranColor.grey[800], // #1B1D27 near-black navy (body text)
    secondary: safranColor.grey[600], // #525668 brand grey
    muted: safranColor.grey[400], // #84899F mid grey-blue
    inverse: safranColor.grey[0], // white on dark / coloured surfaces
    link: safranColor.blue.action // #1767AD AA action blue
  },
  border: {
    subtle: safranColor.grey[200], // #BCBFCF field stroke
    strong: safranColor.grey[400], // #84899F
    interactive: safranColor.blue.action // #1767AD interactive / focus
  },
  action: {
    primary: safranColor.blue.action, // #1767AD AA primary (CTA gradient mid-stop)
    primaryHover: safranColor.blue.deep, // #073A7C deep blue (gradient origin)
    primaryText: safranColor.grey[0], // white text on blue
    secondary: safranColor.grey[400], // #84899F solid grey secondary button
    secondaryHover: safranColor.grey[600], // #525668 darker grey
    secondaryText: safranColor.grey[0], // white text on grey
    danger: safranColor.system.error // #C6541C rust (serves as error)
  },
  feedback: {
    success: safranColor.system.success,
    warning: safranColor.system.warning,
    error: safranColor.system.error,
    info: safranColor.system.info
  },
  status: {
    pending: safranColor.system.warning,
    processing: safranColor.system.info,
    completed: safranColor.system.success,
    failed: safranColor.system.error
  },
  // Categorical data-vis palette built from the brand hues. Safran publishes no
  // 8-colour sequential scale, so this is a coherent proposal drawn from the
  // measured brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: safranColor.blue.action, // #1767AD action blue
    category2: safranColor.blue.bright, // #3B87CC bright brand blue
    category3: safranColor.system.success, // #32D970 green
    category4: safranColor.system.warning, // #C6541C rust
    category5: safranColor.blue.deep, // #073A7C deep blue
    category6: safranColor.blue.light, // #7FB8E7 light blue
    category7: safranColor.grey[600], // #525668 grey
    category8: safranColor.grey[400] // #84899F grey-blue
  }
} as const;

/**
 * The Safran theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Safran-specific values, and the `component`
 * layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Safran brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const safranTheme: TenantTheme = {
  id: "safran",
  label: "Safran",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default safranTheme;
