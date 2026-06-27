import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Dassault Systèmes (3DS) brand theme for the Sentropic token structure.
 *
 * Method = measured-clone. Colours, typography and anatomy signatures are
 * MEASURED from Dassault Systèmes' PUBLIC website CSS (www.3ds.com — the live
 * frontend-toolbox stylesheet and the 3ds-navigation font stylesheet) and
 * cross-checked against the documented corporate blue (branding.3ds.com,
 * encycolorpedia, pickcoloronline). We reference font *names* only (the
 * proprietary "3ds" webfont family), never the binaries. Sources and exact
 * provenance are in MAPPING.md. Where 3DS does not expose an exact published
 * token for a Sentropic role (the full neutral scale, hover/light tints), the
 * closest derived value is used and flagged "à confirmer" in MAPPING.md.
 *
 * Dassault Systèmes colour reference (light theme, measured on www.3ds.com):
 *   White (background default)         #ffffff   (neutral 0 / surface default)
 *   Light grey (background alt)         #f4f6f8   (measured surface subtle)
 *   Light border                        #e3e7ec   (measured field / divider stroke)
 *   Blue-grey (strong border / data)    #669ab6   (measured decorative blue-grey)
 *   Secondary text                      #5f7384   (derived navy-grey — à confirmer)
 *   Muted text                          #45525c   (derived — à confirmer)
 *   Body / primary text                 #2d2d2d   (measured near-black body text)
 *   Deep navy (inverse / darkest)       #04315d   (measured deep navy)
 *   Corporate blue (action / titles)    #005386   (official brand blue — branding.3ds.com; live render ≈ #005686)
 *   Corporate blue hover                #00406a   (derived darker corporate blue — à confirmer)
 *   Bright blue (focus / info)          #0870d3   (measured interactive blue — focus outline)
 *   Cyan accent (compass / 3DEXP.)      #009eff   (measured bright cyan accent)
 *   Success green                       #1c8720   (measured feedback success)
 *   Warning orange                      #c95100   (measured feedback warning)
 *   Error red                           #e32b2e   (measured feedback error)
 *   Info blue                           #0870d3   (measured feedback info = bright blue)
 */

// --- Dassault Systèmes raw colour palette (measured on www.3ds.com) ---------
const dassaultColor = {
  // Corporate blue family. #005386 is the official Dassault Systèmes brand blue
  // (branding.3ds.com / encycolorpedia / pickcoloronline); the live site renders
  // a near-identical #005686. It carries titles, primary action and links. The
  // brighter #0870d3 is the live interactive/focus blue.
  blue: {
    corporate: "#005386", // official 3DS corporate blue — primary action / titles / links
    hover: "#00406a", // derived darker corporate blue for hover (à confirmer)
    deep: "#04315d", // measured deep navy — dark / inverse surface
    bright: "#0870d3", // measured bright interactive blue — focus outline / info
    light: "#e9f7ff" // measured light blue tint
  },
  // Bright cyan accent — the colour of the 3DS "compass" / 3DEXPERIENCE accent.
  // Reserved for accent/data-vis, NOT interactive UI (which uses corporate blue).
  cyan: {
    accent: "#009eff", // measured bright cyan accent (compass / 3DEXPERIENCE)
    light: "#aadcfc", // measured light cyan tint
    dark: "#0870d3" // measured — bright blue reused as the darker accent step (à confirmer)
  },
  // Neutral scale. Surface/border greys are measured live; the secondary/muted
  // text greys are derived to a readable navy-grey (à confirmer).
  grey: {
    0: "#ffffff", // neutral 0 / surface default (measured)
    50: "#f4f6f8", // background alt / surface subtle (measured)
    200: "#e3e7ec", // subtle border / field stroke (measured)
    400: "#d4d4d4", // mid divider border (measured)
    500: "#5f7384", // secondary text / strong border (derived navy-grey — à confirmer)
    600: "#45525c", // muted text (derived — à confirmer)
    700: "#669ab6", // decorative blue-grey (measured)
    800: "#2d2d2d", // primary body text (measured)
    900: "#04315d" // darkest / deep navy inverse (measured)
  },
  // System / status colours, all measured live on www.3ds.com.
  system: {
    success: "#1c8720", // measured feedback success green
    warning: "#c95100", // measured feedback warning orange
    error: "#e32b2e", // measured feedback error red
    info: "#0870d3" // measured feedback info = bright blue
  }
} as const;

// --- foundation (Dassault Systèmes-specific values) -------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the 3DS corporate blue.
    blue: {
      10: dassaultColor.blue.light, // #e9f7ff lightest blue tint
      60: dassaultColor.blue.corporate, // #005386 corporate primary
      80: dassaultColor.blue.hover // #00406a darker interactive blue
    },
    // The Sentropic "cyan" accent slot carries the 3DS bright cyan #009eff —
    // the compass / 3DEXPERIENCE accent (accent/data-vis only, NOT interactive;
    // interactive UI uses corporate blue #005386).
    cyan: {
      10: dassaultColor.cyan.light, // #aadcfc light cyan tint
      50: dassaultColor.cyan.accent, // #009eff compass / 3DEXPERIENCE accent
      70: dassaultColor.cyan.dark // #0870d3 darker accent
    },
    // Sentropic "slate" role family mapped onto the grey scale.
    slate: {
      0: dassaultColor.grey[0], // white
      10: dassaultColor.grey[50], // background alt
      20: dassaultColor.grey[200], // subtle borders / field stroke
      60: dassaultColor.grey[500], // secondary text
      80: dassaultColor.grey[800], // primary text
      90: dassaultColor.grey[900] // deep navy darkest
    },
    feedback: {
      success: dassaultColor.system.success,
      warning: dassaultColor.system.warning,
      error: dassaultColor.system.error,
      info: dassaultColor.system.info
    }
  },
  // Dassault Systèmes' website uses its proprietary corporate webfont "3ds"
  // (3ds-Regular / 3ds-Bold / 3ds-Italic, served from www.3ds.com) for both
  // display titles and body. Display and body therefore both use "3ds"; mono is
  // the system stack. We reference the font *name* only, never the binaries.
  font: {
    sans: "'3ds', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'3ds', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; 3DS uses a comparable 4px-based scale).
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
  // 3DS aesthetic is lightly rounded: controls/inputs carry a measured 3–4px
  // radius, cards a measured 6px radius; pills/tags stay fully rounded.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px — measured control radius
    md: "0.25rem", // 4px — button / input / tabs
    lg: "0.375rem", // 6px — cards (measured)
    pill: "999px" // tags / pills
  },
  // Light, neutral elevation tinted with the brand navy. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(4 49 93 / 0.10)",
    medium: "0 4px 12px rgb(4 49 93 / 0.14)",
    floating: "0 8px 24px rgb(4 49 93 / 0.18)"
  },
  // Motion durations are not strongly tokenised by 3DS publicly; kept aligned
  // with the Sentropic base ("à confirmer").
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
  // --- Anatomy primitives (Dassault Systèmes) ------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border 1px
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. ~40px medium controls (measured live heights 32/36/40px)
  // with 0.75rem inline padding. sm/lg follow the standard size scale.
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // 3DS typography: the proprietary "3ds" family for interactive/fields/labels
  // and display titles. Button labels use "3ds" (weight 500), no transform.
  typography: {
    control: { family: "'3ds', system-ui, sans-serif", size: "1rem", weight: "500", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'3ds', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'3ds', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are corporate blue #005386, not underlined at rest, underlined on hover.
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
  // FOCUS = a high-contrast OUTLINE in the bright blue #0870d3. Measured directly
  // from the 3DS frontend-toolbox CSS: `outline: 2px solid #0870d3` on
  // :focus-visible across controls.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: dassaultColor.blue.bright, // #0870d3 measured focus outline
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px grey border (#e3e7ec)
  // and a 4px radius. `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: dassaultColor.grey[0], // #ffffff
    underlineColor: dassaultColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in corporate blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23005386' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + 6px radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: dassaultColor.grey[50] // #f4f6f8
  },
  // Secondary button = OUTLINED in corporate blue: transparent fill, blue border +
  // text, light blue fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: dassaultColor.blue.corporate, // #005386 stroke
    hoverBackground: dassaultColor.blue.light // #e9f7ff light fill on hover
  },
  // Tabs / top-nav: active tab = bold blue label with a bottom blue underline.
  tabs: {
    activeText: dassaultColor.blue.corporate, // #005386
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
  // Pagination: borderless blue text links; active page = filled corporate blue.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: dassaultColor.blue.corporate, // #005386 link text
    activeBackground: dassaultColor.blue.corporate, // #005386 filled active page
    activeText: dassaultColor.grey[0], // white on blue
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: dassaultColor.blue.corporate, // #005386
    text: dassaultColor.grey[500], // #5f7384 trail text
    currentText: dassaultColor.grey[800], // #2d2d2d current page
    separator: dassaultColor.grey[500], // #5f7384
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700"
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
    text: dassaultColor.grey[800], // #2d2d2d summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
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
    neutralBackground: dassaultColor.grey[50], // #f4f6f8
    neutralText: dassaultColor.grey[800] // #2d2d2d
  },
  // Badge: a 4px-radius filled badge.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: dassaultColor.blue.corporate, // #005386
    infoText: dassaultColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: dassaultColor.grey[800] // #2d2d2d
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
    textColor: dassaultColor.grey[800] // #2d2d2d
  }
} as const;

// --- semantic (Dassault Systèmes-specific role mapping) ---------------------
const semantic = {
  surface: {
    default: dassaultColor.grey[0], // white
    subtle: dassaultColor.grey[50], // #f4f6f8 background alt
    raised: dassaultColor.grey[0], // white
    inverse: dassaultColor.grey[900], // #04315d deep navy inverse surface
    overlay: "rgb(4 49 93 / 0.6)" // modal backdrop (brand navy tint)
  },
  text: {
    primary: dassaultColor.grey[800], // #2d2d2d (body text)
    secondary: dassaultColor.grey[500], // #5f7384
    muted: dassaultColor.grey[600], // #45525c
    inverse: dassaultColor.grey[0], // white on dark / coloured surfaces
    link: dassaultColor.blue.corporate // #005386 corporate blue
  },
  border: {
    subtle: dassaultColor.grey[200], // #e3e7ec (field stroke)
    strong: dassaultColor.grey[500], // #5f7384
    interactive: dassaultColor.blue.corporate // #005386 interactive
  },
  action: {
    primary: dassaultColor.blue.corporate, // #005386 corporate blue primary button
    primaryHover: dassaultColor.blue.hover, // #00406a darker hover (à confirmer)
    primaryText: dassaultColor.grey[0], // white text on blue
    secondary: dassaultColor.grey[50], // #f4f6f8 secondary surface
    secondaryHover: dassaultColor.grey[200], // #e3e7ec
    secondaryText: dassaultColor.blue.corporate, // #005386
    danger: dassaultColor.system.error // #e32b2e error red
  },
  feedback: {
    success: dassaultColor.system.success,
    warning: dassaultColor.system.warning,
    error: dassaultColor.system.error,
    info: dassaultColor.system.info
  },
  status: {
    pending: dassaultColor.system.warning,
    processing: dassaultColor.system.info,
    completed: dassaultColor.system.success,
    failed: dassaultColor.system.error
  },
  // Categorical data-vis palette built from the measured brand hues. 3DS does
  // not publish an 8-colour sequential scale, so this is a coherent proposal
  // drawn from the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: dassaultColor.blue.corporate, // #005386 corporate blue
    category2: dassaultColor.cyan.accent, // #009eff cyan accent
    category3: dassaultColor.blue.bright, // #0870d3 bright blue
    category4: dassaultColor.system.success, // #1c8720 green
    category5: dassaultColor.system.warning, // #c95100 orange
    category6: dassaultColor.system.error, // #e32b2e red
    category7: dassaultColor.blue.deep, // #04315d deep navy
    category8: dassaultColor.grey[700] // #669ab6 blue-grey
  }
} as const;

/**
 * The Dassault Systèmes theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Dassault Systèmes-specific values,
 * and the `component` layer is REBUILT from this theme's own semantic/foundation
 * via `createComponent` — so the brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const dassaultSystemesTheme: TenantTheme = {
  id: "dassault-systemes",
  label: "Dassault Systèmes",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default dassaultSystemesTheme;
