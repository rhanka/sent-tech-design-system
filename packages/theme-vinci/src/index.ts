import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * VINCI brand theme for the Sentropic token structure.
 *
 * All values below are MEASURED from VINCI's PUBLIC live stylesheet — the
 * Drupal `vinci_corp` theme served on vinci.com — read directly off the
 * documented CSS custom properties (`--color-*`, `--font-*`). We only reference
 * the font *names* here (the "Vinci Sans" family is proprietary; we never ship
 * or network-load binaries — consumers fall back to Arial/Helvetica). Sources
 * and exact provenance are in MAPPING.md. Where VINCI does not expose an
 * explicit token for a Sentropic role (darker hover tints, the role of a
 * measured hue as a "feedback" semantic, mono stack), the closest value is used
 * and the choice is flagged "à confirmer" in MAPPING.md.
 *
 * VINCI's identity is a two-colour split, faithfully reproduced here:
 *   - RED `#e20025` (`--color-red`) — the iconic VINCI logotype colour and the
 *     brand signature. This theme elevates it to the PRIMARY action colour
 *     (buttons / active tabs / pagination active page), as the red mark is what
 *     makes VINCI distinctive among blue-corporate peers.
 *   - BLUE `#004489` (`--color-vinci-blue`) + bright blue `#0041b7`
 *     (`--color-blue`) — the dominant interactive colour on vinci.com (links,
 *     focus outline, field/secondary borders). Wired to link / focus /
 *     interactive-border roles, exactly as measured on the live site.
 *
 * VINCI colour reference (light theme, vinci.com `vinci_corp` CSS variables):
 *   White (surface default)            #ffffff   (--color-white)
 *   Extra-light grey (surface alt)     #f0f0f0   (--color-extra-light-grey)
 *   Light grey (subtle border)         #dcdcdc   (--color-light-grey)
 *   Grey 04 (muted)                    #c8c8c8   (--color-grey04)
 *   Grey (secondary text / strong bd)  #6d6d6d   (--color-grey)
 *   Black (primary body text)          #333333   (--color-black)
 *   Darkest neutral                    #1a1a1a   (derived — à confirmer)
 *   VINCI red (PRIMARY / logotype)     #e20025   (--color-red)
 *   VINCI red dark (hover)             #b3001e   (derived — à confirmer)
 *   Extra-light pink (light red tint)  #ffe6e6   (--color-extra-light-pink)
 *   VINCI blue (corporate / link)      #004489   (--color-vinci-blue)
 *   Bright blue (interactive / focus)  #0041b7   (--color-blue)
 *   Light blue (tint)                  #e5f1f9   (--color-blue06)
 *   Green (success)                    #5d8008   (--color-green — role "à confirmer")
 *   Yellow (warning)                   #dd8e00   (--color-yellow — role "à confirmer")
 *   Purple (data-vis)                  #7e00d7   (--color-purple)
 *   Brown (data-vis)                   #b24e1c   (--color-brown)
 *   Pink (data-vis)                    #c4007e   (--color-pink)
 */

// --- VINCI raw colour palette (measured from vinci.com `vinci_corp` CSS) ----
const vinciColor = {
  // Signature red — the VINCI logotype colour. Used here as the primary action.
  red: {
    main: "#e20025", // --color-red (Pantone 485 C cross-check) — VINCI signature red
    dark: "#b3001e", // derived darker red for hover/active (à confirmer)
    light: "#ffe6e6" // --color-extra-light-pink (light red tint)
  },
  // Corporate blue family — the dominant interactive colour on vinci.com.
  blue: {
    vinci: "#004489", // --color-vinci-blue (deep corporate navy — links, headings)
    bright: "#0041b7", // --color-blue (brighter interactive blue — buttons, focus)
    light: "#e5f1f9" // --color-blue06 (light blue tint)
  },
  // Neutral grey scale (VINCI `--color-*` greys).
  grey: {
    0: "#ffffff", // --color-white
    50: "#f0f0f0", // --color-extra-light-grey (background alt)
    100: "#dcdcdc", // --color-light-grey (subtle border)
    400: "#c8c8c8", // --color-grey04 (muted)
    600: "#6d6d6d", // --color-grey (secondary text / strong border)
    800: "#333333", // --color-black (primary body text)
    900: "#1a1a1a" // darkest (derived — à confirmer)
  },
  // System / status colours. VINCI publishes brand hues but no explicit feedback
  // semantics; the hexes below are measured tokens, the ROLE mapping is "à
  // confirmer" (info reuses the bright interactive blue).
  system: {
    success: "#5d8008", // --color-green (brand olive-green — role à confirmer)
    warning: "#dd8e00", // --color-yellow (brand amber — role à confirmer)
    error: "#e20025", // --color-red (brand red doubles as error)
    info: "#0041b7" // --color-blue (bright interactive blue)
  },
  // Extra brand hues, measured — used only for the categorical data-vis palette.
  accent: {
    purple: "#7e00d7", // --color-purple
    brown: "#b24e1c", // --color-brown
    pink: "#c4007e" // --color-pink
  }
} as const;

// --- foundation (VINCI-specific values) ------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family mapped onto the VINCI blue family.
    blue: {
      10: vinciColor.blue.light, // #e5f1f9 light blue tint
      60: vinciColor.blue.bright, // #0041b7 bright interactive blue
      80: vinciColor.blue.vinci // #004489 deep corporate navy
    },
    // The Sentropic "cyan" accent slot carries the VINCI signature RED — the
    // logotype colour, also wired to action.primary in semantic below.
    cyan: {
      10: vinciColor.red.light, // #ffe6e6 light red tint
      50: vinciColor.red.main, // #e20025 VINCI signature red
      70: vinciColor.red.dark // #b3001e darker red (à confirmer)
    },
    // Sentropic "slate" role family mapped onto the grey scale.
    slate: {
      0: vinciColor.grey[0], // white
      10: vinciColor.grey[50], // background alt
      20: vinciColor.grey[100], // subtle borders
      60: vinciColor.grey[600], // secondary text
      80: vinciColor.grey[800], // primary text
      90: vinciColor.grey[900] // darkest (à confirmer)
    },
    feedback: {
      success: vinciColor.system.success,
      warning: vinciColor.system.warning,
      error: vinciColor.system.error,
      info: vinciColor.system.info
    }
  },
  // VINCI ships a proprietary "Vinci Sans" family (`--font-standard`), with
  // "Vinci Sans Expanded" for headings (`--font-heading-main`) and a "Vinci
  // Serif". These fonts are NOT distributable, so we reference the *names* only
  // and let consumers fall back to the live site's own Arial/Helvetica stack.
  // No mono is published by VINCI; the system mono stack is used (à confirmer).
  font: {
    sans: "'Vinci Sans', Arial, Helvetica, sans-serif",
    display: "'Vinci Sans Expanded', Arial, Helvetica, sans-serif",
    mono: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Standard rem spacing scale (kept aligned with the Sentropic base for
  // component-grid fidelity; VINCI uses a comparable rem scale).
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
  // VINCI aesthetic is lightly rounded: controls/inputs carry a 4px radius
  // (`border-radius:.25rem`), cards an 8px radius (`border-radius:.5rem` /
  // `8px`, both measured on vinci.com).
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.25rem", // 4px — button / input / tabs
    lg: "0.5rem", // 8px — cards
    pill: "999px" // tags / pills
  },
  // Light, neutral elevation tinted with the corporate navy. Exact specs
  // "à confirmer" (VINCI does not strongly tokenise shadows publicly).
  shadow: {
    subtle: "0 1px 2px rgb(0 68 137 / 0.10)",
    medium: "0 4px 12px rgb(0 68 137 / 0.14)",
    floating: "0 8px 24px rgb(0 68 137 / 0.18)"
  },
  // Motion durations are not strongly tokenised by VINCI publicly; kept aligned
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
  // --- Anatomy primitives (VINCI) ------------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px", // measured field/control border = .0625rem (1px)
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // Control density. ~40px medium controls with 0.75rem inline padding; sm/lg
  // follow the standard size scale ("à confirmer").
  density: {
    sm: { controlHeight: "2rem", paddingBlock: "0", paddingInline: "0.5rem", gap: "0.5rem", minWidth: "2rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.5rem", paddingBlock: "0.375rem", paddingInline: "0.75rem", gap: "0.5rem", minWidth: "2.5rem", fontSize: "1rem" },
    lg: { controlHeight: "3rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "3rem", fontSize: "1.125rem" }
  },
  // VINCI typography: "Vinci Sans" for interactive/fields/labels; "Vinci Sans
  // Expanded" for display titles. Button labels use Vinci Sans (weight 600).
  typography: {
    control: { family: "'Vinci Sans', Arial, sans-serif", size: "1rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Vinci Sans', Arial, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Vinci Sans', Arial, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // Links are VINCI blue #004489, not underlined at rest, underlined on hover.
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
  // FOCUS = a high-contrast OUTLINE in the bright VINCI blue #0041b7. Measured
  // on vinci.com: `outline:.125rem solid var(--color-blue)` (2px, the dominant
  // focus colour across the site, 28 occurrences).
  focus: {
    strategy: "outline",
    width: "2px",
    offset: "2px",
    color: vinciColor.blue.bright, // #0041b7 bright blue focus outline
    inset: "0"
  },
  // Form fields are BOXED (outline): a white fill, a 1px solid border and a 4px
  // radius (measured `border:.0625rem solid`). `style: "outline"` makes the
  // builder draw four equal borders from `surface.default` + `border.subtle`.
  field: {
    style: "outline",
    fillBg: vinciColor.grey[0], // #ffffff
    underlineColor: vinciColor.grey[100], // unused for outline, kept for completeness
    underlineWidth: "1px",
    // Native <select>: redraw the chevron in VINCI blue with a 40px right gutter.
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23004489' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // Cards: a subtle 1px grey border + 8px radius, light hover tint.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: vinciColor.grey[50] // #f0f0f0
  },
  // Secondary button = OUTLINED in VINCI blue: transparent fill, blue border +
  // text, light blue fill on hover (measured: blue-bordered secondary actions).
  buttonSecondary: {
    background: "transparent",
    border: vinciColor.blue.vinci, // #004489 stroke
    hoverBackground: vinciColor.blue.light // #e5f1f9 light blue fill on hover
  },
  // Tabs / top-nav: active tab = bold VINCI red label with a bottom red
  // underline (the red signature applied to the active indicator).
  tabs: {
    activeText: vinciColor.red.main, // #e20025
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
  // Pagination: VINCI-blue text links; active page = filled VINCI red.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: vinciColor.blue.vinci, // #004489 link text
    activeBackground: vinciColor.red.main, // #e20025 filled active page
    activeText: vinciColor.grey[0], // white on red
    activeBorderWidth: "0",
    paddingBlock: "0.25rem", // 4px
    paddingInline: "0.75rem", // 12px
    minSize: "2.25rem", // 36px page box
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem" // 24px
  },
  // Breadcrumb: blue links, dark current page, grey separators.
  breadcrumb: {
    linkText: vinciColor.blue.vinci, // #004489
    text: vinciColor.grey[600], // #6d6d6d trail text
    currentText: vinciColor.grey[800], // #333333 current page
    separator: vinciColor.grey[600], // #6d6d6d
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
    text: vinciColor.grey[800], // #333333 summary label
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
    neutralBackground: vinciColor.grey[50], // #f0f0f0
    neutralText: vinciColor.grey[800] // #333333
  },
  // Badge: a 4px-radius filled badge in VINCI blue.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    fontWeight: "700",
    lineHeight: "1.5rem", // 24px
    textTransform: "none",
    minHeight: "1.5rem", // 24px
    infoBackground: vinciColor.blue.vinci, // #004489
    infoText: vinciColor.grey[0] // white
  },
  // Checkbox/radio label.
  choice: {
    labelFontSize: "1rem", // 16px
    labelLineHeight: "1.5rem", // 24px
    radioLineHeight: "1.5rem", // 24px
    labelColor: vinciColor.grey[800] // #333333
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
    textColor: vinciColor.grey[800] // #333333
  }
} as const;

// --- semantic (VINCI-specific role mapping) --------------------------------
const semantic = {
  surface: {
    default: vinciColor.grey[0], // white
    subtle: vinciColor.grey[50], // #f0f0f0 background alt
    raised: vinciColor.grey[0], // white
    inverse: vinciColor.blue.vinci, // #004489 deep corporate navy inverse surface
    overlay: "rgb(0 68 137 / 0.6)" // modal backdrop (corporate navy tint)
  },
  text: {
    primary: vinciColor.grey[800], // #333333 body text (--color-black)
    secondary: vinciColor.grey[600], // #6d6d6d (--color-grey)
    muted: vinciColor.grey[400], // #c8c8c8 (--color-grey04)
    inverse: vinciColor.grey[0], // white on dark / coloured surfaces
    link: vinciColor.blue.vinci // #004489 VINCI blue links
  },
  border: {
    subtle: vinciColor.grey[100], // #dcdcdc (--color-light-grey)
    strong: vinciColor.grey[600], // #6d6d6d (--color-grey)
    interactive: vinciColor.blue.vinci // #004489 interactive / focus border
  },
  action: {
    primary: vinciColor.red.main, // #e20025 VINCI red primary button (signature)
    primaryHover: vinciColor.red.dark, // #b3001e darker red hover (à confirmer)
    primaryText: vinciColor.grey[0], // white text on red
    secondary: vinciColor.grey[50], // #f0f0f0 secondary surface
    secondaryHover: vinciColor.grey[100], // #dcdcdc
    secondaryText: vinciColor.blue.vinci, // #004489 blue secondary text
    danger: vinciColor.system.error // #e20025 (brand red doubles as danger)
  },
  feedback: {
    success: vinciColor.system.success,
    warning: vinciColor.system.warning,
    error: vinciColor.system.error,
    info: vinciColor.system.info
  },
  status: {
    pending: vinciColor.system.warning,
    processing: vinciColor.system.info,
    completed: vinciColor.system.success,
    failed: vinciColor.system.error
  },
  // Categorical data-vis palette built entirely from MEASURED VINCI `--color-*`
  // hues (red, blue, green, yellow, purple, brown, pink + bright blue). VINCI
  // does not publish an ordered 8-step sequential scale, so the ORDER is a
  // coherent proposal (see MAPPING.md, "à confirmer").
  data: {
    category1: vinciColor.red.main, // #e20025 red
    category2: vinciColor.blue.vinci, // #004489 corporate blue
    category3: vinciColor.system.success, // #5d8008 green
    category4: vinciColor.system.warning, // #dd8e00 yellow
    category5: vinciColor.accent.purple, // #7e00d7 purple
    category6: vinciColor.blue.bright, // #0041b7 bright blue
    category7: vinciColor.accent.brown, // #b24e1c brown
    category8: vinciColor.accent.pink // #c4007e pink
  }
} as const;

/**
 * The VINCI theme as a Sentropic `TenantTheme`. The `tokens` tree is complete:
 * `foundation` and `semantic` carry VINCI-specific values, and the `component`
 * layer is REBUILT from this theme's own semantic/foundation via
 * `createComponent` — so the VINCI brand reaches the components (buttons, tabs,
 * pagination, chat bubbles…), not just the elements that read semantic vars
 * directly.
 */
export const vinciTheme: TenantTheme = {
  id: "vinci",
  label: "VINCI",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default vinciTheme;
