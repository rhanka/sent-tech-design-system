import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Eurofins Scientific brand theme for the Sentropic token structure.
 *
 * Eurofins Scientific SE (ERF / FR0014000MR3, CAC 40, Luxembourg, Euronext
 * Paris) publishes no tokenised public design system; the brand values below
 * are MEASURED from the public corporate stylesheets served from
 * `cdnmediaassets.eurofins.com` and linked from `https://www.eurofins.com/`
 * (and `https://www.eurofins.fr/`, which redirects to `eurofins.com/fr-fr/`
 * and serves the same tokens — see MAPPING.md). The signature is the deep
 * corporate blue (#003883, `--primary-color`) with the accessible orange
 * accent (#E3660E, `--accessible-color`). We reference the brand font *names*
 * (Inter for body, Fira Sans for headings) only — never font binaries.
 * Sources and exact provenance are documented in MAPPING.md. Where the brand
 * publishes no direct equivalent for a Sentropic role, the closest derived
 * value is used and the choice is noted "à confirmer" in MAPPING.md.
 *
 * Eurofins colour reference (light theme):
 *   White (body background)              #ffffff   (surface default)
 *   Light grey background                #FAFAFA   (subtle surface)
 *   Light grey hairline                  #E5E5E5   (subtle border)
 *   Medium grey                          #808080   (strong border)
 *   Grey                                 #666666   (secondary text)
 *   Dim grey                             #4D4D4D   (muted text)
 *   Heading near-black                   #212b36   (primary text)
 *   Navy blue (footer / inverse)         #00224F   (inverse surface)
 *   Corporate blue (brand / action)      #003883   (`--primary-color`)
 *   Button hover blue                    #00306F   (measured hover — see MAPPING.md)
 *   Sky background tint                  #EBF3FF   (secondary surface)
 *   Cool blue hover tint                 #DCEBFF   (secondary hover)
 *   Bright blue (info)                   #0061E0   (info)
 *   Deep blue                            #004BAD   (deep brand blue)
 *   Accessible orange (brand accent)     #E3660E   (`--accessible-color`)
 *   Secondary orange                     #EE7D11   (`--secondary-color`)
 *   Burnt orange (warnings)              #C75000   (warning)
 *   Beige tint                           #FEF8F3   (light accent tint)
 *   Success green                        #317234   (success)
 *   Crimson red (errors)                 #b71c1c   (error / danger)
 *   Soft purple                          #9398C7   (data accent)
 */

// --- Eurofins Scientific raw colour palette ---------------------------------
const eurofinsColor = {
  // Corporate blue — the Eurofins signature brand colour
  // (`--primary-color` in the brand `:root` block of style.min.css).
  blue: {
    primary: "#003883", // Eurofins corporate blue — `--primary-color` (brand)
    hover: "#00306F", // measured button hover — `.btn-primary --bs-btn-hover-bg:rgb(0, 47.6, 111.35)` (brand)
    deep: "#004BAD", // deep brand blue — `--deep-blue` (brand)
    bright: "#0061E0", // bright brand blue — `--bright-blue` (brand)
    navy: "#00224F", // footer navy — `--navy-blue`, `.footer{background-color:#00224F}` (brand)
    sky: "#EBF3FF", // light blue tint — `--sky-background` (brand)
    cool: "#DCEBFF" // cool blue tint — `--cool-blue` (brand)
  },
  // Orange accent family — the Eurofins secondary brand colour.
  accent: {
    accessible: "#E3660E", // accessible orange — `--accessible-color` (brand)
    secondary: "#EE7D11", // secondary orange — `--secondary-color` (brand)
    burnt: "#C75000", // burnt orange — `--burnt-orange` (brand)
    beige: "#FEF8F3" // light beige tint — `--beige` (brand)
  },
  // Neutral scale — every step is a brand-declared variable.
  slate: {
    0: "#ffffff", // white — `--body-color` / `--white` (brand)
    50: "#FAFAFA", // light grey background — `--gray-background` (brand)
    200: "#E5E5E5", // light grey hairline — `--light-gray` (brand)
    400: "#808080", // medium grey — `--gray-2` (brand)
    500: "#666666", // grey — `--grey` (brand)
    600: "#4D4D4D", // dim grey — `--dim-gray` (brand)
    800: "#212b36", // heading near-black — `--heading-color` (brand)
    900: "#00224F" // navy — darkest brand surface (brand)
  },
  // System / status colours — each is a brand-declared variable used in
  // brand-scoped rules (see MAPPING.md).
  system: {
    success: "#317234", // brand green — `--green` (brand)
    warning: "#C75000", // burnt orange — `--burnt-orange` (brand)
    error: "#b71c1c", // crimson red — `--crimson-red` (brand)
    info: "#0061E0" // bright blue — `--bright-blue` (brand)
  },
  // Soft purple — `--purple`, used for menu hover states (brand).
  purple: "#9398C7" // soft purple — `--purple` (brand)
} as const;

// --- foundation (Eurofins-Scientific-specific values) ------------------------
const foundation = {
  color: {
    // Eurofins has no dominant brand CYAN-free BLUE problem: the Sentropic
    // "blue" role family (primary action / link / interactive) carries the
    // corporate blue — the brand's colour of action.
    blue: {
      10: eurofinsColor.blue.sky, // #EBF3FF light blue tint
      60: eurofinsColor.blue.primary, // #003883 corporate blue (primary)
      80: eurofinsColor.blue.hover // #00306F measured button hover
    },
    // The Sentropic "cyan" accent slot carries the Eurofins orange accent
    // family (the brand's second colour).
    cyan: {
      10: eurofinsColor.accent.beige, // #FEF8F3 light accent tint (brand)
      50: eurofinsColor.accent.accessible, // #E3660E accessible orange (brand)
      70: eurofinsColor.accent.burnt // #C75000 burnt orange (brand)
    },
    // Sentropic "slate" role family mapped onto the brand neutral scale.
    slate: {
      0: eurofinsColor.slate[0], // white
      10: eurofinsColor.slate[50], // light grey background
      20: eurofinsColor.slate[200], // light grey hairline
      60: eurofinsColor.slate[500], // grey secondary text
      80: eurofinsColor.slate[800], // heading near-black
      90: eurofinsColor.slate[900] // navy darkest
    },
    feedback: {
      success: eurofinsColor.system.success,
      warning: eurofinsColor.system.warning,
      error: eurofinsColor.system.error,
      info: eurofinsColor.system.info
    }
  },
  // Eurofins ships Inter as its body typeface (`--body-font:"Inter"`) and
  // Fira Sans as its heading typeface (`--heading-font:"Fira Sans"`, with
  // `@font-face` faces in font_style.css); we use Inter for body/controls
  // and Fira Sans for display. mono is the system stack. We reference the
  // font *names* only, not binaries.
  font: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Fira Sans', 'Inter', system-ui, -apple-system, sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (matches the Sentropic base values; the brand
  // root is the 16px default — no `font-size` on `html`/`:root` — so rem
  // values transcribe 1:1).
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
  // Eurofins aesthetic is rounded at 8px: brand CTAs (`.btn-get-started`,
  // `.btn-get-notify`), inputs (`.form-control` brand override, search
  // inputs) and menus all carry `border-radius:8px`.
  radius: {
    none: "0",
    sm: "0.5rem", // 8px — inputs / small controls (brand)
    md: "0.5rem", // 8px — buttons / CTAs (brand)
    lg: "0.5rem", // 8px — cards (à confirmer)
    pill: "999px" // tags / pills
  },
  // Elevation: the subtle level is the brand menu shadow
  // (`box-shadow:0 6px 24px 0 rgb(0 0 0 / .25)` on the language menu);
  // medium/floating are aligned with the reference theme package's geometry
  // (à confirmer).
  shadow: {
    subtle: "0 6px 24px rgb(0 0 0 / 0.25)", // brand menu shadow
    medium: "0 4px 12px rgb(0 34 79 / 0.14)", // aligned with the reference theme package's geometry (à confirmer)
    floating: "0 8px 24px rgb(0 34 79 / 0.18)" // aligned with the reference theme package's geometry (à confirmer)
  },
  // Motion durations are not tokenised by the brand publicly; kept aligned
  // with the reference theme package's geometry ("à confirmer").
  motion: {
    fast: "120ms", // aligned with the reference theme package's geometry (à confirmer)
    normal: "180ms", // aligned with the reference theme package's geometry (à confirmer)
    slow: "280ms", // aligned with the reference theme package's geometry (à confirmer)
    easing: "cubic-bezier(0.4, 0, 0.2, 1)" // aligned with the reference theme package's geometry (à confirmer)
  },
  // z-index roles are not brand-specific; kept aligned with the Sentropic base.
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Anatomy primitives (Eurofins Scientific) ------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border 1px
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. The brand publishes input padding (`.form-control`
  // `padding:.375rem .75rem`, `font-size:1rem`) but no general control
  // height (the 68px CTA and 42px search input are scoped widgets — see
  // MAPPING.md), so heights stay on the Sentropic base, marked à confirmer.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" }, // heights aligned with the reference theme package's geometry (à confirmer)
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" }, // padding + font-size measured from `.form-control` (brand)
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" } // heights aligned with the reference theme package's geometry (à confirmer)
  },
  // Eurofins typography: Fira Sans 700 for brand buttons (`.btn-get-started`
  // `font-family:"Fira Sans",sans-serif;font-size:20px;font-weight:700`);
  // Inter 400 for fields (`.form-control` `font-size:1rem;font-weight:400`
  // over the Inter body); labels in Inter (à confirmer).
  typography: {
    control: { family: "'Fira Sans', 'Inter', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" }, // family/weight measured from brand CTAs (à confirmer for size)
    field: { family: "'Inter', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" }, // measured from `.form-control` (brand)
    label: { family: "'Inter', system-ui, sans-serif", size: "0.875rem", weight: "600", lineHeight: "1.4", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" }, // aligned with the reference theme package's geometry (à confirmer)
    // Brand links are the corporate blue #003883 (`--bs-link-color`), not
    // underlined at rest (`--bs-link-decoration:none`), underlined on hover
    // (à confirmer).
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto" // aligned with the reference theme package's geometry (à confirmer)
    }
  },
  disabledOpacity: "0.5", // aligned with the reference theme package's geometry (à confirmer)
  transition: { property: "background-color, border-color, color, box-shadow", duration: "150ms", easing: "ease-in-out" }, // aligned with the reference theme package's geometry (à confirmer)
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a box-shadow RING in a corporate-blue tint. The brand's form
  // controls declare `outline:0` + `box-shadow:0 0 0 .25rem rgb(0 56 131 /
  // .25)` (`.form-control:focus`, `.form-select:focus`,
  // `.form-check-input:focus` — rgb(0 56 131) is #003883).
  focus: {
    strategy: "ring",
    width: "0.25rem",
    offset: "0",
    color: eurofinsColor.blue.primary, // #003883 corporate blue focus ring
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px grey border and an
  // 8px brand radius. `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: eurofinsColor.slate[0], // #ffffff
    underlineColor: eurofinsColor.slate[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the corporate blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23003883' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + the 8px brand radius, light hover tint
  // (à confirmer).
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: eurofinsColor.slate[50] // #FAFAFA (à confirmer)
  },
  // Secondary button = OUTLINED in the corporate blue: transparent fill, blue
  // border + text, light blue fill on hover (à confirmer).
  buttonSecondary: {
    background: "transparent",
    border: eurofinsColor.blue.primary, // #003883 stroke
    hoverBackground: eurofinsColor.blue.sky // #EBF3FF light fill on hover (à confirmer)
  },
  // Tabs / top-nav: active tab = corporate-blue label with a bottom blue
  // underline (à confirmer).
  tabs: {
    activeText: eurofinsColor.blue.primary, // #003883
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem", // 12px (à confirmer)
    paddingInline: "1rem", // 16px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // Pagination: borderless corporate-blue text links; active page = filled
  // corporate blue with white text (à confirmer).
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: eurofinsColor.blue.primary, // #003883 link text
    activeBackground: eurofinsColor.blue.primary, // #003883 filled active page
    activeText: "#ffffff", // white text on the corporate blue (à confirmer)
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px (à confirmer)
    paddingInline: "0.75rem", // 12px (à confirmer)
    minSize: "2.25rem", // 36px page box (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Breadcrumb: corporate-blue links, grey trail, near-black current page
  // (à confirmer — the brand's own breadcrumb links are menu-scoped).
  breadcrumb: {
    linkText: eurofinsColor.blue.primary, // #003883
    text: eurofinsColor.slate[500], // #666666 trail text (à confirmer)
    currentText: eurofinsColor.slate[800], // #212b36 current page (à confirmer)
    separator: eurofinsColor.slate[500], // #666666 (à confirmer)
    fontSize: "0.875rem", // 14px (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    currentWeight: "700" // (à confirmer)
  },
  // Alert / notice: a coloured LEFT accent filet on a transparent box
  // (à confirmer).
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar (à confirmer)
    paddingTop: "1rem", // 16px (à confirmer)
    paddingRight: "1rem", // 16px (à confirmer)
    paddingBottom: "1rem", // 16px (à confirmer)
    paddingLeft: "1.25rem", // 20px (clears the left filet) (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Accordion / details: a near-black bold summary trigger (à confirmer).
  accordion: {
    text: eurofinsColor.slate[800], // #212b36 summary label (à confirmer)
    paddingBlock: "0.75rem", // 12px (à confirmer)
    paddingInline: "1rem", // 16px (à confirmer)
    fontSize: "1rem", // 16px (à confirmer)
    fontWeight: "700", // (à confirmer)
    lineHeight: "1.5rem" // 24px (à confirmer)
  },
  // Tag: an 8px-radius neutral chip (brand radius; à confirmer).
  tag: {
    radius: "8px",
    paddingBlock: "0.25rem", // 4px (à confirmer)
    paddingInline: "0.5rem", // 8px (à confirmer)
    fontSize: "0.875rem", // 14px (à confirmer)
    fontWeight: "400", // (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    minHeight: "1.5rem", // 24px (à confirmer)
    neutralBackground: eurofinsColor.slate[50], // #FAFAFA (à confirmer)
    neutralText: eurofinsColor.slate[800] // #212b36 (à confirmer)
  },
  // Badge: an 8px-radius filled badge in the corporate blue with white text
  // (à confirmer).
  badge: {
    radius: "8px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px (à confirmer)
    fontSize: "0.875rem", // 14px (à confirmer)
    fontWeight: "700", // (à confirmer)
    lineHeight: "1.5rem", // 24px (à confirmer)
    textTransform: "none", // (à confirmer)
    minHeight: "1.5rem", // 24px (à confirmer)
    infoBackground: eurofinsColor.blue.primary, // #003883 (à confirmer)
    infoText: "#ffffff" // white on corporate blue (à confirmer)
  },
  // Checkbox/radio label (à confirmer).
  choice: {
    labelFontSize: "1rem", // 16px (à confirmer)
    labelLineHeight: "1.5rem", // 24px (à confirmer)
    radioLineHeight: "1.5rem", // 24px (à confirmer)
    labelColor: eurofinsColor.slate[800] // #212b36 (à confirmer)
  },
  // Search input: brand input padding and metrics (`.form-control`
  // `padding:.375rem .75rem`, `font-size:1rem`, `line-height:1.5`).
  search: {
    paddingBlock: "0.375rem", // 6px (brand)
    paddingInline: "0.75rem", // 12px (brand)
    fontSize: "1rem", // 16px (brand)
    lineHeight: "1.5rem" // 24px (brand)
  },
  // Toggle / switch label (à confirmer).
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px (à confirmer)
    textColor: eurofinsColor.slate[800] // #212b36 (à confirmer)
  }
} as const;

// --- semantic (Eurofins-Scientific-specific role mapping) --------------------
const semantic = {
  surface: {
    default: eurofinsColor.slate[0], // white — `--body-color`
    subtle: eurofinsColor.slate[50], // #FAFAFA `--gray-background`
    raised: eurofinsColor.slate[0], // white
    inverse: eurofinsColor.slate[900], // #00224F navy — `.footer{background-color:#00224F}`
    overlay: "rgb(0 34 79 / 0.6)" // modal backdrop, navy tint (à confirmer)
  },
  text: {
    primary: eurofinsColor.slate[800], // #212b36 — `--heading-color`
    secondary: eurofinsColor.slate[500], // #666666 — `--grey`
    muted: eurofinsColor.slate[600], // #4D4D4D — `--dim-gray`
    inverse: eurofinsColor.slate[0], // white on dark / coloured surfaces
    link: eurofinsColor.blue.primary // #003883 — `--bs-link-color`
  },
  border: {
    subtle: eurofinsColor.slate[200], // #E5E5E5 — `--light-gray`
    strong: eurofinsColor.slate[400], // #808080 — `--gray-2`
    interactive: eurofinsColor.blue.primary // #003883 corporate blue
  },
  action: {
    primary: eurofinsColor.blue.primary, // #003883 corporate blue
    primaryHover: eurofinsColor.blue.hover, // #00306F measured button hover
    primaryText: "#ffffff", // white on corporate blue — `.btn-primary --bs-btn-color:#ffffff` (brand)
    secondary: eurofinsColor.blue.sky, // #EBF3FF `--sky-background`
    secondaryHover: eurofinsColor.blue.cool, // #DCEBFF `--cool-blue`
    secondaryText: eurofinsColor.blue.primary, // #003883
    danger: eurofinsColor.system.error // #b71c1c `--crimson-red`
  },
  feedback: {
    success: eurofinsColor.system.success,
    warning: eurofinsColor.system.warning,
    error: eurofinsColor.system.error,
    info: eurofinsColor.system.info
  },
  status: {
    pending: eurofinsColor.system.warning,
    processing: eurofinsColor.system.info,
    completed: eurofinsColor.system.success,
    failed: eurofinsColor.system.error
  },
  // Categorical data-vis palette built from the brand hues. Eurofins
  // publishes no 8-colour sequential scale, so this is a coherent proposal
  // drawn from the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: eurofinsColor.blue.primary, // #003883 corporate blue (brand)
    category2: eurofinsColor.accent.accessible, // #E3660E accessible orange (brand)
    category3: eurofinsColor.blue.bright, // #0061E0 bright blue (brand)
    category4: eurofinsColor.system.success, // #317234 brand green (brand)
    category5: eurofinsColor.accent.burnt, // #C75000 burnt orange (brand)
    category6: eurofinsColor.purple, // #9398C7 soft purple (brand)
    category7: eurofinsColor.blue.deep, // #004BAD deep blue (brand)
    category8: eurofinsColor.slate[800] // #212b36 near-black (brand)
  }
} as const;

/**
 * The Eurofins Scientific theme as a Sentropic `TenantTheme`. The `tokens`
 * tree is complete: `foundation` and `semantic` carry Eurofins-specific
 * values, and the `component` layer is REBUILT from this theme's own
 * semantic/foundation via `createComponent` — so the corporate blue reaches
 * the components (buttons, tabs, pagination, chat bubbles…), not just the
 * elements that read semantic vars directly.
 */
export const eurofinsTheme: TenantTheme = {
  id: "eurofins",
  label: "Eurofins Scientific",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default eurofinsTheme;
