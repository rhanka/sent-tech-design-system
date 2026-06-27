import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Bouygues GROUP brand theme for the Sentropic token structure.
 *
 * All values below are MEASURED from Bouygues' PUBLIC live site
 * (bouygues.com — the holding "Groupe Bouygues / Donnons vie au progrès",
 * NOT a subsidiary like Bouygues Telecom or Colas) and from the official
 * group logo SVG. We only reference font *names* (Lato) here, never font
 * binaries. Sources and exact provenance are documented in MAPPING.md.
 *
 * IMPORTANT — measured reality vs the "blue" premise:
 * The Bouygues GROUP brand is an ORANGE brand. The official group logotype
 * (logo-bouygues-2022.svg) draws the "aile" (wing) emblem in orange #f26724,
 * and the live bouygues.com CSS uses orange #e75113 as its primary action /
 * link / button colour (by far the most frequent brand colour). The corporate
 * blue #0050b4, the deep navy #273584 and the turquoise #3ec2cf DO exist in
 * the palette but as SECONDARY accents (button fills, gradients, dark
 * sections). This package is therefore a faithful measured-clone: ORANGE is
 * primary, and the blue family is wired as the prominent secondary accent and
 * the navy inverse surface. See MAPPING.md "À confirmer / Écart de prémisse".
 *
 * Bouygues colour reference (light theme, measured on bouygues.com):
 *   White (background default)        #ffffff   (surface default)
 *   Grey light (background alt)       #f1f1f1   (live CSS background tint)
 *   Grey alt / subtle border          #ebebeb   (live CSS background/border tint)
 *   Border default                    #c4c4c4   (live CSS border)
 *   Muted grey                        #8f8f8f   (live CSS muted text)
 *   Secondary text                    #646464   (live CSS secondary text)
 *   Primary text (near-black)         #14151a   (live CSS body text)
 *   Logo wordmark (near-black)        #12100b   (official logo-bouygues-2022.svg)
 *   Brand orange (logo wing)          #f26724   (official logo-bouygues-2022.svg fill)
 *   Brand orange (action / link)      #e75113   (live CSS primary action / buttons / links)
 *   Orange hover / active             #d33f00   (live CSS darker orange)
 *   Deep red-orange                   #dc2319   (live CSS gradient start / strong accent → error)
 *   Amber                             #f7921e   (live CSS amber → warning family)
 *   Corporate blue (accent)           #0050b4   (live CSS button fills / gradient start)
 *   Deep navy (inverse / accent)      #273584   (live CSS dark sections / accent)
 *   Turquoise (accent)                #3ec2cf   (live CSS gradient end / accent)
 */

// --- Bouygues raw colour palette (measured on bouygues.com) ----------------
const bouyguesColor = {
  // Brand ORANGE — the Bouygues group's primary identity (the "aile"/wing) and
  // the live site's action / link / button colour.
  orange: {
    wing: "#f26724", // official logo-bouygues-2022.svg wing fill (brand orange)
    main: "#e75113", // live CSS primary action / links / buttons (most frequent brand colour)
    dark: "#d33f00", // live CSS darker orange — hover / active
    deep: "#dc2319", // live CSS deep red-orange (gradient start) — strong accent / error
    amber: "#f7921e", // live CSS amber — warning family
    light: "#fdeae0" // derived light orange tint (à confirmer)
  },
  // Corporate BLUE family — the brand's SECONDARY accent (button fills,
  // gradients, dark sections). Present on bouygues.com but never the primary.
  blue: {
    corporate: "#0050b4", // live CSS corporate blue (button fills / gradient start)
    navy: "#273584", // live CSS deep navy (dark sections / inverse surface)
    turquoise: "#3ec2cf", // live CSS turquoise accent (gradient end)
    light: "#e6f0fb" // derived light blue tint (à confirmer)
  },
  // Neutral grey scale (measured on bouygues.com).
  grey: {
    0: "#ffffff", // surface default
    50: "#f1f1f1", // background alt (live CSS)
    100: "#ebebeb", // background/border tint (live CSS)
    200: "#c4c4c4", // border default (live CSS)
    500: "#8f8f8f", // muted text (live CSS)
    600: "#646464", // secondary text (live CSS)
    800: "#14151a", // primary text / near-black (live CSS)
    900: "#12100b" // logo wordmark near-black (official logo)
  },
  // System / status colours. error/warning/info are measured on the live site;
  // success is derived (the measured greens #86bc22/#21ca99 are decorative, not
  // a semantic success — darkened for WCAG AA on white, à confirmer).
  system: {
    success: "#1a7a43", // derived green for AA on white (à confirmer)
    warning: "#f7921e", // live CSS amber (light for AA text — à confirmer)
    error: "#dc2319", // live CSS deep red-orange
    info: "#0050b4" // live CSS corporate blue
  }
} as const;

// --- foundation (Bouygues-specific values) ---------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family = the PRIMARY brand family. For Bouygues the
    // primary is the brand ORANGE (the "aile"), so the orange family is wired
    // into this primary slot (the slot name is the Sentropic role, not the hue).
    blue: {
      10: bouyguesColor.orange.light, // lightest orange tint
      60: bouyguesColor.orange.main, // #e75113 brand orange primary
      80: bouyguesColor.orange.dark // #d33f00 darker interactive orange
    },
    // Sentropic "cyan" accent slot = Bouygues' SECONDARY corporate BLUE family
    // (#0050b4 → navy #273584). This is the "blue" of the brand — real, but
    // secondary to the orange.
    cyan: {
      10: bouyguesColor.blue.light, // light corporate-blue tint
      50: bouyguesColor.blue.corporate, // #0050b4 corporate blue accent
      70: bouyguesColor.blue.navy // #273584 deep navy
    },
    // Sentropic "slate" role family mapped onto the grey scale.
    slate: {
      0: bouyguesColor.grey[0], // white
      10: bouyguesColor.grey[50], // background alt
      20: bouyguesColor.grey[200], // border default
      60: bouyguesColor.grey[600], // secondary text
      80: bouyguesColor.grey[800], // primary text
      90: bouyguesColor.grey[900] // darkest (logo wordmark)
    },
    feedback: {
      success: bouyguesColor.system.success,
      warning: bouyguesColor.system.warning,
      error: bouyguesColor.system.error,
      info: bouyguesColor.system.info
    }
  },
  // bouygues.com uses "Lato" as its primary UI / body typeface (the WordPress
  // theme exposes `--wp--preset--font-family--lato`); "Roboto" appears as a
  // secondary heading face. Display and body therefore both use Lato; mono is
  // the system stack. We reference the font *names* only, not the binaries.
  font: {
    sans: "'Lato', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Lato', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity).
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
  // Bouygues aesthetic is rounded: inputs/tabs carry a small radius, cards a
  // larger one, and CTAs are PILL-shaped (the live site uses border-radius:30px
  // on buttons → pills). Exact input radius "à confirmer".
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.5rem", // 8px — input / tabs
    lg: "1rem", // 16px — cards
    pill: "999px" // buttons / tags / pills (Bouygues CTAs are pills)
  },
  // Light, neutral elevation tinted with the brand navy. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(20 21 26 / 0.10)",
    medium: "0 4px 12px rgb(20 21 26 / 0.14)",
    floating: "0 8px 24px rgb(20 21 26 / 0.18)"
  },
  // Motion durations are not strongly tokenised publicly; kept aligned with the
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
  // --- Anatomy primitives (Bouygues) ---------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border 1px
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. ~44px medium CTAs with generous inline padding (Bouygues
  // CTAs are large rounded buttons). sm/lg follow the standard scale ("à confirmer").
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // Bouygues typography: Lato for interactive / fields / labels and display
  // titles. Button labels use Lato (weight 700), no transform.
  typography: {
    control: { family: "'Lato', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Lato', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Lato', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are orange #e75113, not underlined at rest, underlined on hover.
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
  // FOCUS = a high-contrast OUTLINE in the brand orange #e75113.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: bouyguesColor.orange.main, // #e75113 brand orange focus outline
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px grey border (#c4c4c4)
  // and a small radius. `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: bouyguesColor.grey[0], // #ffffff
    underlineColor: bouyguesColor.grey[200], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in the brand orange with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23e75113' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + rounded corners, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: bouyguesColor.grey[50] // #f1f1f1
  },
  // Secondary button = OUTLINED in brand orange: transparent fill, orange border
  // + text, light orange fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: bouyguesColor.orange.main, // #e75113 stroke
    hoverBackground: bouyguesColor.orange.light // #fdeae0 light fill on hover
  },
  // Tabs / top-nav: active tab = bold orange label with a bottom orange underline.
  tabs: {
    activeText: bouyguesColor.orange.main, // #e75113
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
  // Pagination: borderless orange text links; active page = filled brand orange.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: bouyguesColor.orange.main, // #e75113 link text
    activeBackground: bouyguesColor.orange.main, // #e75113 filled active page
    activeText: bouyguesColor.grey[0], // white on orange
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: orange links, dark current page, grey separators.
  breadcrumb: {
    linkText: bouyguesColor.orange.main, // #e75113
    text: bouyguesColor.grey[600], // #646464 trail text
    currentText: bouyguesColor.grey[800], // #14151a current page
    separator: bouyguesColor.grey[500], // #8f8f8f
    fontSize: "0.875rem", // 14px
    lineHeight: "1.5rem", // 24px
    currentWeight: "700"
  },
  // Alert / notice: a coloured LEFT accent filet on a transparent box (the live
  // site uses a 4px left orange border on callouts).
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem", // 4px ::before accent bar (matches live CSS border-left 4px)
    paddingTop: "1rem", // 16px
    paddingRight: "1rem", // 16px
    paddingBottom: "1rem", // 16px
    paddingLeft: "1.25rem", // 20px (clears the left filet)
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Accordion / details: a dark bold summary trigger.
  accordion: {
    text: bouyguesColor.grey[800], // #14151a summary label
    paddingBlock: "0.75rem", // 12px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    fontWeight: "700",
    lineHeight: "1.5rem" // 24px
  },
  // Tag: a small rounded grey chip.
  tag: {
    radius: "4px",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.5rem", // 24px
    minHeight: "1.5rem", // 24px
    neutralBackground: bouyguesColor.grey[50], // #f1f1f1
    neutralText: bouyguesColor.grey[800] // #14151a
  },
  // Badge: a rounded filled badge. "info" tone uses the corporate blue #0050b4.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: bouyguesColor.blue.corporate, // #0050b4 corporate blue
    infoText: bouyguesColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: bouyguesColor.grey[800] // #14151a
  },
  // Search input.
  search: {
    paddingBlock: "0.5rem", // 8px
    paddingInline: "1rem", // 16px
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Toggle / switch label.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem", // 24px
    textColor: bouyguesColor.grey[800] // #14151a
  }
} as const;

// --- semantic (Bouygues-specific role mapping) -----------------------------
const semantic = {
  surface: {
    default: bouyguesColor.grey[0], // white
    subtle: bouyguesColor.grey[50], // #f1f1f1 background alt
    raised: bouyguesColor.grey[0], // white
    inverse: bouyguesColor.blue.navy, // #273584 deep navy inverse surface (brand dark sections)
    overlay: "rgb(39 53 132 / 0.6)" // modal backdrop (brand navy tint)
  },
  text: {
    primary: bouyguesColor.grey[800], // #14151a body text
    secondary: bouyguesColor.grey[600], // #646464
    muted: bouyguesColor.grey[500], // #8f8f8f
    inverse: bouyguesColor.grey[0], // white on dark / coloured surfaces
    link: bouyguesColor.orange.main // #e75113 brand orange link
  },
  border: {
    subtle: bouyguesColor.grey[100], // #ebebeb
    strong: bouyguesColor.grey[200], // #c4c4c4
    interactive: bouyguesColor.orange.main // #e75113 focus / interactive
  },
  action: {
    primary: bouyguesColor.orange.main, // #e75113 brand orange primary button
    primaryHover: bouyguesColor.orange.dark, // #d33f00 darker hover
    primaryText: bouyguesColor.grey[0], // white text on orange
    secondary: bouyguesColor.grey[50], // #f1f1f1 secondary surface
    secondaryHover: bouyguesColor.grey[100], // #ebebeb
    secondaryText: bouyguesColor.orange.main, // #e75113
    danger: bouyguesColor.system.error // #dc2319
  },
  feedback: {
    success: bouyguesColor.system.success,
    warning: bouyguesColor.system.warning,
    error: bouyguesColor.system.error,
    info: bouyguesColor.system.info
  },
  status: {
    pending: bouyguesColor.system.warning,
    processing: bouyguesColor.system.info,
    completed: bouyguesColor.system.success,
    failed: bouyguesColor.system.error
  },
  // Categorical data-vis palette built from the measured brand hues (orange,
  // corporate blue, turquoise, navy, green, red, grey, amber). Bouygues does
  // not publish an 8-colour sequential scale, so this is a coherent proposal
  // drawn from the brand palette (see MAPPING.md, "à confirmer").
  data: {
    category1: bouyguesColor.orange.main, // #e75113 brand orange
    category2: bouyguesColor.blue.corporate, // #0050b4 corporate blue
    category3: bouyguesColor.blue.turquoise, // #3ec2cf turquoise
    category4: bouyguesColor.blue.navy, // #273584 navy
    category5: "#86bc22", // measured brand green (decorative)
    category6: bouyguesColor.orange.deep, // #dc2319 deep red-orange
    category7: bouyguesColor.grey[600], // #646464 grey
    category8: bouyguesColor.orange.amber // #f7921e amber
  }
} as const;

/**
 * The Bouygues group theme as a Sentropic `TenantTheme`. The `tokens` tree is
 * complete: `foundation` and `semantic` carry Bouygues-specific values, and the
 * `component` layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Bouygues brand reaches the components (buttons,
 * tabs, pagination, chat bubbles…), not just the elements that read semantic
 * vars directly.
 */
export const bouyguesTheme: TenantTheme = {
  id: "bouygues",
  label: "Bouygues",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default bouyguesTheme;
