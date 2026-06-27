import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Veolia brand theme for the Sentropic token structure.
 *
 * Veolia is the French environmental-services group (water / waste / energy).
 * Method = measured-clone: the brand colours, typeface choice and anatomy are
 * taken from Veolia's PUBLIC 2024 graphic charter ("the essentials of the
 * graphic charter", veolia.am brand PDF) and cross-checked against the live
 * veolia.com digital UI (its compiled CSS). We reference font *names* only
 * (TheSans, FS Rufus, Arial, Noto Sans) — never font binaries. Sources and
 * exact provenance are documented in MAPPING.md. Values Veolia does not publish
 * as exact hexes for digital UI roles (neutral scale steps, hover/light/deep
 * derivations, the feedback set) are flagged "à confirmer" in MAPPING.md.
 *
 * Veolia colour reference:
 *   Red (THE brand colour)             #FF0000   (PANTONE 485 C — 2024 charter HEX, logotype + "Red")
 *   Red (live digital UI)              #EE0000   (rendered on veolia.com — design_v2.css)
 *   Black                              #000000   (PANTONE PROCESS BLACK C — charter)
 *   White (background default)         #FFFFFF   (charter)
 *   Cool Gray 11 (brand grey)          #55555A   (PANTONE COOL GRAY 11 — charter, R85 G85 B90)
 *   Turquoise (accent / water segment) #05C3DD   (PANTONE 311C — charter "Turquoise")
 *   Pale blue                          #99E1EF   (PANTONE 636 C — charter "Pale blue")
 *   Green (waste/recycling segment)    #78BE21   (PANTONE 368C — charter "Green")
 *   Forest green (success)             #438D42   (PANTONE 7741 C — charter "Forest green")
 *   Orange (warning)                   #FF6900   (PANTONE 1505C — charter "Orange")
 *   Yellow (energy segment)            #FFD616   (PANTONE 129C — charter "Yellow")
 *   Marine (deep blue / info)          #002D62   (PANTONE 295C — charter "Marine")
 *   Purple                             #772583   (PANTONE 2612C — charter "Purple")
 */

// --- Veolia raw colour palette (public 2024 graphic charter + live UI) ------
const veoliaColor = {
  // Veolia RED — THE brand colour: the logotype is always red, and red is the
  // primary action / link family in this clone. The charter assigns #FF0000
  // (PANTONE 485 C) as the official screen HEX.
  red: {
    main: "#FF0000", // PANTONE 485 C — official 2024 charter HEX (logotype + "Red")
    web: "#EE0000", // red rendered on the live veolia.com UI (design_v2.css --theme-bg-color)
    hover: "#CC0000", // derived darker red for hover (à confirmer)
    deep: "#990000", // derived deep red for danger/error, AA on white (à confirmer)
    light: "#FFE5E5" // derived light red tint for low-emphasis surfaces (à confirmer)
  },
  // Turquoise — the brand accent (water / digital business segment).
  turquoise: {
    main: "#05C3DD", // PANTONE 311C — charter "Turquoise" (water segment symbol colour)
    pale: "#99E1EF", // PANTONE 636 C — charter "Pale blue"
    dark: "#098192" // live veolia.com dark teal (--theme-bg-color) — darker turquoise step
  },
  // Brand bright-palette greens (charter): a vivid segment green + a darker
  // forest green used for the success semantic.
  green: {
    bright: "#78BE21", // PANTONE 368C — charter "Green" (waste/recycling segment, data accent)
    forest: "#438D42" // PANTONE 7741 C — charter "Forest green" (success)
  },
  // Other charter bright-palette hues used for warning/info and data-vis.
  orange: "#FF6900", // PANTONE 1505C — charter "Orange" (warning)
  yellow: "#FFD616", // PANTONE 129C — charter "Yellow" (energy segment)
  marine: "#002D62", // PANTONE 295C — charter "Marine" (deep blue / info)
  purple: "#772583", // PANTONE 2612C — charter "Purple"
  // Neutral grey scale: the charter brand grey (Cool Gray 11) plus the greys
  // actually rendered on veolia.com (live --theme-bg-color tokens).
  grey: {
    0: "#ffffff", // white (charter)
    50: "#f2f2f2", // background alt (live --theme-bg-color)
    100: "#e5e5e5", // subtle border (live)
    300: "#cccccc", // border (live)
    400: "#999999", // strong border (live)
    500: "#808080", // muted text (live)
    550: "#55555a", // PANTONE COOL GRAY 11 — charter brand grey (R85 G85 B90)
    600: "#666666", // secondary text (live)
    800: "#333333", // primary text (live, dominant)
    900: "#191919" // near-black dark surface (live)
  },
  black: "#000000", // PANTONE PROCESS BLACK C — charter
  // System / status colours. The charter publishes no semantic feedback set, so
  // these are mapped from the brand bright palette (success=forest green,
  // warning=orange, info=marine) with a derived deep red for error (à confirmer).
  system: {
    success: "#438D42", // charter Forest green (PANTONE 7741 C) — darker for AA on white
    warning: "#FF6900", // charter Orange (PANTONE 1505C)
    error: "#990000", // derived deep red (à confirmer) — distinct from the bright brand red
    info: "#002D62" // charter Marine (PANTONE 295C) — AA-safe deep blue
  }
} as const;

// --- foundation (Veolia-specific values) -----------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family carries Veolia's RED — the primary/action
    // family of this brand (buttons, links, focus, active states).
    blue: {
      10: veoliaColor.red.light, // #FFE5E5 lightest red tint
      60: veoliaColor.red.main, // #FF0000 Veolia red (primary)
      80: veoliaColor.red.hover // #CC0000 darker interactive red
    },
    // The Sentropic "cyan" accent slot carries Veolia's TURQUOISE #05C3DD —
    // the water/digital segment accent (decorative / data-vis, not the primary
    // action colour, which is the red above).
    cyan: {
      10: veoliaColor.turquoise.pale, // #99E1EF pale blue tint
      50: veoliaColor.turquoise.main, // #05C3DD Turquoise accent
      70: veoliaColor.turquoise.dark // #098192 darker turquoise
    },
    // Sentropic "slate" role family mapped onto the Veolia grey scale.
    slate: {
      0: veoliaColor.grey[0], // white
      10: veoliaColor.grey[50], // background alt
      20: veoliaColor.grey[100], // subtle borders / contrast background
      60: veoliaColor.grey[550], // secondary text (Cool Gray 11)
      80: veoliaColor.grey[800], // primary text
      90: veoliaColor.grey[900] // near-black
    },
    feedback: {
      success: veoliaColor.system.success,
      warning: veoliaColor.system.warning,
      error: veoliaColor.system.error,
      info: veoliaColor.system.info
    }
  },
  // Veolia's brand publishing typeface is "TheSans" (proprietary, LucasFonts);
  // the live veolia.com web UI falls back to "Noto Sans" then "Arial" (the
  // charter's licensed web/office font). The logotype font "FS Rufus" is
  // reserved for the logo only and is deliberately NOT used here. We reference
  // font *names* only, never binaries.
  font: {
    sans: "'TheSans', 'Noto Sans', Arial, Helvetica, system-ui, sans-serif",
    display: "'TheSans', 'Noto Sans', Arial, Helvetica, system-ui, sans-serif",
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
  // Veolia's 2024 identity is bold and geometric (the symbol is built "in a
  // square"); the live UI uses small radii. Controls/inputs carry a 4px radius,
  // cards a slightly larger 8px (à confirmer).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.25rem", // 4px — button / input / tabs
    lg: "0.5rem", // 8px — cards
    pill: "999px" // tags / pills
  },
  // Light, neutral elevation tinted with the brand near-black. Exact specs "à confirmer".
  shadow: {
    subtle: "0 1px 2px rgb(25 25 25 / 0.10)",
    medium: "0 4px 12px rgb(25 25 25 / 0.14)",
    floating: "0 8px 24px rgb(25 25 25 / 0.18)"
  },
  // Motion durations are not strongly tokenised by Veolia publicly; kept
  // aligned with the Sentropic base ("à confirmer").
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
  // --- Anatomy primitives (Veolia) -----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // field border 1px
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density: a substantial, touch-friendly corporate scale (md ≈ 44px)
  // with generous horizontal padding. sm/lg follow the standard size scale
  // ("à confirmer").
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // Veolia typography: TheSans/Noto-Sans stack everywhere. Button labels are
  // bold (the brand reads bold), no transform.
  typography: {
    control: { family: "'TheSans', 'Noto Sans', Arial, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'TheSans', 'Noto Sans', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'TheSans', 'Noto Sans', Arial, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Brand links are red #FF0000, not underlined at rest, underlined on hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto",
      textDecorationHover: "underline", decorationThicknessHover: "auto", decorationOffsetHover: "auto"
    }
  },
  disabledOpacity: "0.5", // disabled controls dim to 0.5 (à confirmer)
  transition: { property: "background-color, border-color, color, outline-color", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // FOCUS = a high-contrast OUTLINE in the Veolia red #FF0000.
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: veoliaColor.red.main, // #FF0000 Veolia red focus outline
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px grey border (#e5e5e5)
  // and a 4px radius. `style: "outline"` makes the builder draw four equal
  // borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: veoliaColor.grey[0], // #ffffff
    underlineColor: veoliaColor.grey[100], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in Veolia red with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23FF0000' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + slight radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: veoliaColor.grey[50] // #f2f2f2
  },
  // Secondary button = OUTLINED in Veolia red: transparent fill, red border +
  // text, light red fill on hover.
  buttonSecondary: {
    background: "transparent",
    border: veoliaColor.red.main, // #FF0000 stroke
    hoverBackground: veoliaColor.red.light // #FFE5E5 light fill on hover
  },
  // Tabs / top-nav: active tab = bold red label with a bottom red underline.
  tabs: {
    activeText: veoliaColor.red.main, // #FF0000
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
  // Pagination: borderless red text links; active page = filled Veolia red.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: veoliaColor.red.main, // #FF0000 link text
    activeBackground: veoliaColor.red.main, // #FF0000 filled active page
    activeText: veoliaColor.grey[0], // white on red
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: red links, dark current page, grey separators.
  breadcrumb: {
    linkText: veoliaColor.red.main, // #FF0000
    text: veoliaColor.grey[550], // #55555a trail text
    currentText: veoliaColor.grey[800], // #333333 current page
    separator: veoliaColor.grey[500], // #808080
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
    text: veoliaColor.grey[800], // #333333 summary label
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
    neutralBackground: veoliaColor.grey[50], // #f2f2f2
    neutralText: veoliaColor.grey[800] // #333333
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
    infoBackground: veoliaColor.red.main, // #FF0000
    infoText: veoliaColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: veoliaColor.grey[800] // #333333
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
    textColor: veoliaColor.grey[800] // #333333
  }
} as const;

// --- semantic (Veolia-specific role mapping) -------------------------------
const semantic = {
  surface: {
    default: veoliaColor.grey[0], // white
    subtle: veoliaColor.grey[50], // #f2f2f2 background alt
    raised: veoliaColor.grey[0], // white
    inverse: veoliaColor.grey[900], // #191919 near-black inverse surface
    overlay: "rgb(25 25 25 / 0.6)" // modal backdrop (near-black tint)
  },
  text: {
    primary: veoliaColor.grey[800], // #333333 (body text)
    secondary: veoliaColor.grey[550], // #55555a Cool Gray 11
    muted: veoliaColor.grey[500], // #808080
    inverse: veoliaColor.grey[0], // white on dark / coloured surfaces
    link: veoliaColor.red.main // #FF0000 Veolia red
  },
  border: {
    subtle: veoliaColor.grey[100], // #e5e5e5 (field stroke)
    strong: veoliaColor.grey[400], // #999999
    interactive: veoliaColor.red.main // #FF0000 focus / interactive
  },
  action: {
    primary: veoliaColor.red.main, // #FF0000 Veolia red primary button
    primaryHover: veoliaColor.red.hover, // #CC0000 darker hover (à confirmer)
    primaryText: veoliaColor.grey[0], // white text on red
    secondary: veoliaColor.grey[50], // #f2f2f2 secondary surface
    secondaryHover: veoliaColor.grey[100], // #e5e5e5
    secondaryText: veoliaColor.red.main, // #FF0000
    danger: veoliaColor.system.error // #990000 deep error red
  },
  feedback: {
    success: veoliaColor.system.success,
    warning: veoliaColor.system.warning,
    error: veoliaColor.system.error,
    info: veoliaColor.system.info
  },
  status: {
    pending: veoliaColor.system.warning,
    processing: veoliaColor.system.info,
    completed: veoliaColor.system.success,
    failed: veoliaColor.system.error
  },
  // Categorical data-vis palette built from the Veolia bright charter palette
  // (red, turquoise=water, green=waste, yellow=energy, orange, purple, marine,
  // grey). Veolia does not publish an 8-colour sequential scale, so this is a
  // coherent proposal from the brand hues (see MAPPING.md, "à confirmer").
  data: {
    category1: veoliaColor.red.main, // #FF0000 brand red
    category2: veoliaColor.turquoise.main, // #05C3DD turquoise (water)
    category3: veoliaColor.green.bright, // #78BE21 green (waste)
    category4: veoliaColor.yellow, // #FFD616 yellow (energy)
    category5: veoliaColor.orange, // #FF6900 orange
    category6: veoliaColor.purple, // #772583 purple
    category7: veoliaColor.marine, // #002D62 marine
    category8: veoliaColor.grey[550] // #55555a cool gray
  }
} as const;

/**
 * The Veolia theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry Veolia-specific values, and the `component`
 * layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the Veolia brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const veoliaTheme: TenantTheme = {
  id: "veolia",
  label: "Veolia",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default veoliaTheme;
